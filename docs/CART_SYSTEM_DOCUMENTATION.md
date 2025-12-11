# Shopping Cart System - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Server Actions (actions.ts)](#server-actions-actionsts)
4. [Cart Components](#cart-components)
5. [Cart Logic Flow](#cart-logic-flow)
6. [Data Flow Diagram](#data-flow-diagram)
7. [Key Concepts](#key-concepts)

---

## Overview

The shopping cart system is built using:
- **Next.js 16** with App Router
- **Prisma ORM** for database operations
- **PostgreSQL** database
- **Server Actions** for server-side operations
- **Client Components** for interactive UI
- **Cookie-based cart identification** (no user authentication required)

### Architecture Pattern
- **Server Components**: Fetch and display data (CartPage, CartSummary)
- **Client Components**: Handle user interactions (CartEntry, CartCount, AddToCartButton)
- **Server Actions**: Perform database operations securely
- **Event System**: Custom events for real-time cart updates

---

## Database Schema

### Models

#### 1. Cart Model
```prisma
model Cart {
  id        String     @id @default(uuid())
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  items     CartItem[]
}
```

**Purpose**: Represents a shopping cart session
- Each cart has a unique UUID
- Tracks creation and update timestamps
- Has a one-to-many relationship with CartItem

#### 2. CartItem Model
```prisma
model CartItem {
  id        String   @id @default(uuid())
  cartId    String
  productId String
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  cart      Cart     @relation(fields: [cartId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])

  @@unique([cartId, productId])  // Prevents duplicate products in same cart
  @@index([cartId])
  @@index([productId])
}
```

**Purpose**: Represents a product added to a cart
- Links a Product to a Cart
- Stores quantity of the product
- Unique constraint: Same product can't be added twice (quantity is updated instead)
- Indexed for fast lookups

#### 3. Product Model (Reference)
```prisma
model Product {
  id          String     @id @default(uuid())
  name        String
  description String
  price       Decimal    @db.Decimal(10, 2)  // Important: Decimal type
  image       String
  categoryId  String
  slug        String     @unique
  inventory   Int        @default(0)
  cartItems   CartItem[]
  category    Category   @relation(fields: [categoryId], references: [id])
}
```

**Key Points**:
- `price` is `Decimal` type (not number) - requires conversion for client components
- `image` is a URL string
- `inventory` tracks available stock

---

## Server Actions (actions.ts)

All server actions are marked with `"use server"` and run on the server side only.

### Type Definitions

#### CartWithProducts
```typescript
export type CartWithProducts = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;
```
**Purpose**: Type for cart with all related products loaded from database

#### ShoppingCart
```typescript
export type ShoppingCart = CartWithProducts & {
  size: number;      // Total quantity of all items
  subtotal: number;  // Total price of all items
};
```
**Purpose**: Extended cart type with calculated fields

#### SerializedShoppingCart
```typescript
export type SerializedShoppingCart = Omit<ShoppingCart, "items"> & {
  items: Array<
    Omit<ShoppingCart["items"][0], "product"> & {
      product: Omit<ShoppingCart["items"][0]["product"], "price" | "image"> & {
        price: number;        // Decimal converted to number
        image: string | null; // Ensured to be string
      };
    }
  >;
};
```
**Purpose**: Client-safe version with Decimal converted to number and image as string

**Why needed?**: 
- Prisma `Decimal` objects cannot be serialized to client components
- Next.js requires plain objects for client-server communication
- This type ensures all data is serializable

---

### Core Helper Functions

#### findCartFromCookie()
```typescript
async function findCartFromCookie(): Promise<CartWithProducts | null>
```

**Purpose**: Internal helper to find cart using cookie

**How it works**:
1. Reads `cartId` from HTTP-only cookie
2. If no cookie exists, returns `null`
3. Queries database for cart with all items and products
4. Returns cart or `null`

**Cookie Security**:
- `httpOnly: true` - Prevents JavaScript access (XSS protection)
- `secure: true` in production - HTTPS only
- `sameSite: "lax"` - CSRF protection

#### getOrCreateCart()
```typescript
async function getOrCreateCart(): Promise<CartWithProducts>
```

**Purpose**: Gets existing cart or creates a new one

**Flow**:
1. Tries to find cart from cookie
2. If found, returns it
3. If not found:
   - Creates new cart in database
   - Sets `cartId` cookie
   - Returns new cart

**Use Case**: Called before adding items to ensure cart exists

---

### Public API Functions

#### 1. getCart()
```typescript
export async function getCart(): Promise<SerializedShoppingCart | null>
```

**Purpose**: Get full cart data for display

**Returns**: 
- `SerializedShoppingCart` with all items and products
- `null` if no cart exists

**Key Operations**:
1. Finds cart from cookie
2. **Serializes data**:
   - Converts `Decimal` price → `number`
   - Ensures `image` is `string`
3. Calculates `size` (total quantity)
4. Calculates `subtotal` (total price)

**Example Usage**:
```typescript
const cart = await getCart();
// cart.items[0].product.price is now a number (not Decimal)
// cart.size = total quantity
// cart.subtotal = total price
```

**Why Serialization?**
- Client components cannot receive Prisma Decimal objects
- Must convert to plain JavaScript types
- Happens once on server before sending to client

---

#### 2. getCartSize()
```typescript
export async function getCartSize(): Promise<number>
```

**Purpose**: Get total quantity of items in cart (for badge display)

**Returns**: Number (0 if no cart)

**Optimization**: 
- Only fetches items (not full product data)
- Lightweight query for frequent updates

**Example Usage**:
```typescript
const count = await getCartSize(); // e.g., 5 items
```

---

#### 3. addToCart()
```typescript
export async function addToCart(
  productId: string, 
  quantity: number
): Promise<{ success: true }>
```

**Purpose**: Add product to cart or increase quantity

**Parameters**:
- `productId`: UUID of product to add
- `quantity`: Number of items to add (must be > 0)

**Logic Flow**:
1. Validates quantity > 0
2. Gets or creates cart
3. Checks if product already exists in cart:
   - **If exists**: Updates quantity (adds to existing)
   - **If new**: Creates new cart item
4. Returns success

**Example**:
```typescript
// First time adding product
await addToCart("product-123", 1); // Creates CartItem with quantity=1

// Adding same product again
await addToCart("product-123", 2); // Updates to quantity=3
```

**Error Handling**: Throws if quantity <= 0

---

#### 4. removeFromCart()
```typescript
export async function removeFromCart(
  cartItemId: string
): Promise<{ success: true }>
```

**Purpose**: Completely remove an item from cart

**Parameters**:
- `cartItemId`: UUID of the cart item to remove

**Operation**: Deletes the CartItem from database

**Use Case**: User clicks delete/trash button

---

#### 5. updateCartItemQuantity()
```typescript
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<{ success: true }>
```

**Purpose**: Set specific quantity for cart item

**Parameters**:
- `cartItemId`: UUID of cart item
- `quantity`: New quantity (if <= 0, item is removed)

**Logic**:
- If quantity <= 0: Calls `removeFromCart()`
- Otherwise: Updates quantity in database

**Use Case**: Direct quantity input (not used in current UI, but available)

---

#### 6. incrementCartItem()
```typescript
export async function incrementCartItem(
  cartItemId: string
): Promise<{ success: true }>
```

**Purpose**: Increase quantity by 1

**Flow**:
1. Finds cart item
2. Throws error if not found
3. Updates quantity: `quantity + 1`

**Use Case**: User clicks "+" button

---

#### 7. decrementCartItem()
```typescript
export async function decrementCartItem(
  cartItemId: string
): Promise<{ success: true }>
```

**Purpose**: Decrease quantity by 1 (or remove if quantity becomes 0)

**Flow**:
1. Finds cart item
2. Throws error if not found
3. Checks current quantity:
   - If `quantity <= 1`: Removes item completely
   - Otherwise: Updates quantity: `quantity - 1`

**Use Case**: User clicks "-" button

**Smart Behavior**: Automatically removes item if quantity would be 0

---

## Cart Components

### 1. CartEntry Component

**File**: `components/CartEntry.tsx`  
**Type**: Client Component (`"use client"`)

**Purpose**: Display and manage a single cart item

#### Props
```typescript
interface CartEntryProps {
  item: SerializedShoppingCart["items"][0];
}
```

#### Features

**Display**:
- Product image (with error fallback)
- Product name (link to product page)
- Unit price
- Quantity controls (+/- buttons)
- Total price (unit price × quantity)
- Delete button

**Interactions**:
- **Increment**: Increases quantity by 1
- **Decrement**: Decreases quantity by 1 (removes if becomes 0)
- **Delete**: Removes item completely
- **Image Click**: Navigates to product page
- **Name Click**: Navigates to product page

#### State Management
```typescript
const [isUpdating, setIsUpdating] = useState(false);  // Prevents double-clicks
const [imageError, setImageError] = useState(false);   // Image load error handling
```

#### Event Flow
1. User clicks button (increment/decrement/delete)
2. Sets `isUpdating = true` (disables buttons)
3. Calls server action
4. Dispatches `cartUpdated` event
5. Refreshes router (updates page data)
6. Sets `isUpdating = false`

#### Key Code Patterns

**Increment Handler**:
```typescript
const handleIncrement = async () => {
  setIsUpdating(true);
  try {
    await incrementCartItem(item.id);
    window.dispatchEvent(new Event("cartUpdated"));
    router.refresh();
  } catch (error) {
    console.error("Failed to increment item:", error);
  } finally {
    setIsUpdating(false);
  }
};
```

**Why `router.refresh()`?**
- Server components don't auto-update
- Forces re-fetch of server data
- Ensures cart summary updates

**Image Handling**:
- Uses regular `<img>` tag (not Next.js Image)
- Reason: Avoids refresh issues with Next.js Image optimization
- Has error fallback to "No Image" div

---

### 2. CartCount Component

**File**: `components/CartCount.tsx`  
**Type**: Client Component

**Purpose**: Display cart item count badge in navbar

#### Features
- Shows total quantity as badge
- Updates in real-time via events
- Hides when count is 0

#### State
```typescript
const [count, setCount] = useState<number>(0);
```

#### Lifecycle

**Initial Load**:
```typescript
useEffect(() => {
  async function fetchCartSize() {
    const size = await getCartSize();
    setCount(size);
  }
  fetchCartSize();
}, []);
```

**Event Listener**:
```typescript
useEffect(() => {
  const handleCartUpdate = () => {
    getCartSize().then((size) => {
      setCount(size);
    });
  };

  window.addEventListener("cartUpdated", handleCartUpdate);
  return () => window.removeEventListener("cartUpdated", handleCartUpdate);
}, []);
```

**How Events Work**:
1. Any component dispatches: `window.dispatchEvent(new Event("cartUpdated"))`
2. CartCount listener fires
3. Fetches new cart size
4. Updates badge count

**Why Events?**
- Decouples components
- Real-time updates across app
- No prop drilling needed

---

### 3. CartSummary Component

**File**: `components/CartSummary.tsx`  
**Type**: Server Component (async)

**Purpose**: Display order summary with totals

#### Features
- Item count
- Subtotal
- Total (same as subtotal, can add taxes/shipping later)
- Checkout button

#### Server Component Benefits
- Fetches fresh data on every render
- No client-side state needed
- Always shows accurate totals

#### Rendering Logic
```typescript
if (!cart || cart.items.length === 0) {
  return null;  // Don't show if cart is empty
}
```

**Why Server Component?**
- Totals must be accurate
- No need for interactivity
- Simpler code (no useState/useEffect)

---

### 4. AddToCartButton Component

**File**: `components/AddToCartButton.tsx`  
**Type**: Client Component

**Purpose**: Add product to cart from product page

#### Props
```typescript
interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number | any;
    inventory: number;
  };
}
```

#### Features
- Full-width button
- Loading state ("Adding...")
- Disabled when out of stock
- Dispatches `cartUpdated` event
- Refreshes page after adding

#### Logic
```typescript
const handleAddToCart = async () => {
  if (product.inventory === 0 || isAdding) return;  // Guard clause

  setIsAdding(true);
  try {
    await addToCart(product.id, 1);  // Always adds 1
    window.dispatchEvent(new Event("cartUpdated"));
    router.refresh();
  } catch (error) {
    console.error("Failed to add to cart:", error);
  } finally {
    setIsAdding(false);
  }
};
```

**Inventory Check**: Prevents adding out-of-stock items

---

### 5. CartPage Component

**File**: `app/cart/page.tsx`  
**Type**: Server Component (async)

**Purpose**: Main cart page

#### Structure
1. Fetches cart data
2. Shows empty state if no items
3. Renders list of CartEntry components
4. Renders CartSummary at bottom

#### Empty State
```typescript
if (!cart || cart.items.length === 0) {
  return (
    // Empty cart message
    // "Continue Shopping" link
  );
}
```

#### Layout
```
┌─────────────────────────┐
│   Shopping Cart Title   │
├─────────────────────────┤
│   CartEntry (item 1)    │
│   CartEntry (item 2)    │
│   CartEntry (item 3)    │
├─────────────────────────┤
│   CartSummary           │
│   - Items count         │
│   - Subtotal            │
│   - Checkout button     │
└─────────────────────────┘
```

---

## Cart Logic Flow

### Adding Item to Cart

```
User clicks "Add to Cart"
    ↓
AddToCartButton.handleAddToCart()
    ↓
addToCart(productId, 1) [Server Action]
    ↓
getOrCreateCart() [Helper]
    ├─ Cookie exists? → Find cart
    └─ No cookie? → Create cart + Set cookie
    ↓
Check if product already in cart
    ├─ Exists? → Update quantity (add to existing)
    └─ New? → Create CartItem
    ↓
Return { success: true }
    ↓
Dispatch "cartUpdated" event
    ↓
router.refresh() [Updates page]
    ↓
CartCount listens → Updates badge
CartPage re-renders → Shows new item
```

### Updating Quantity

```
User clicks "+" or "-" button
    ↓
CartEntry.handleIncrement() or handleDecrement()
    ↓
incrementCartItem() or decrementCartItem() [Server Action]
    ↓
Find CartItem in database
    ↓
Update quantity (+1 or -1)
    ├─ Decrement: If quantity <= 1 → Remove item
    └─ Otherwise → Update quantity
    ↓
Return { success: true }
    ↓
Dispatch "cartUpdated" event
    ↓
router.refresh()
    ↓
CartEntry re-renders with new quantity
CartSummary re-renders with new totals
CartCount updates badge
```

### Removing Item

```
User clicks trash icon
    ↓
CartEntry.handleRemove()
    ↓
removeFromCart(cartItemId) [Server Action]
    ↓
Delete CartItem from database
    ↓
Return { success: true }
    ↓
Dispatch "cartUpdated" event
    ↓
router.refresh()
    ↓
Item removed from list
CartSummary updates totals
CartCount updates badge
```

### Page Load Flow

```
User visits /cart
    ↓
CartPage (Server Component) renders
    ↓
getCart() [Server Action]
    ↓
findCartFromCookie()
    ├─ Cookie exists? → Query database
    └─ No cookie? → Return null
    ↓
Serialize data (Decimal → number)
    ↓
Calculate size and subtotal
    ↓
Return SerializedShoppingCart
    ↓
Render CartEntry for each item
Render CartSummary
    ↓
CartEntry (Client) mounts
    ├─ Sets up event listeners
    └─ Ready for interactions
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │ CartEntry    │    │ CartCount    │    │ AddToCartBtn │ │
│  │ (Client)     │    │ (Client)     │    │ (Client)     │ │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘ │
│         │                    │                    │         │
│         │ Server Actions     │ Server Actions     │         │
│         │ Events             │ Events             │         │
│         └──────────┬─────────┴──────────┬─────────┘         │
│                    │                    │                   │
│                    ▼                    ▼                   │
│         ┌───────────────────────────────┐                  │
│         │   "cartUpdated" Event          │                  │
│         │   (Custom Window Event)        │                  │
│         └───────────────────────────────┘                  │
│                                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP Request
                        │ (Server Actions)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              actions.ts (Server Actions)              │ │
│  │  - getCart()                                          │ │
│  │  - getCartSize()                                      │ │
│  │  - addToCart()                                        │ │
│  │  - incrementCartItem()                                │ │
│  │  - decrementCartItem()                                │ │
│  │  - removeFromCart()                                   │ │
│  └───────────────────┬──────────────────────────────────┘ │
│                      │                                     │
│                      │ Prisma Queries                      │
│                      ▼                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Prisma ORM                               │ │
│  │  - findUnique()                                       │ │
│  │  - create()                                           │ │
│  │  - update()                                           │ │
│  │  - delete()                                           │ │
│  └───────────────────┬──────────────────────────────────┘ │
│                      │                                     │
│                      │ SQL Queries                         │
│                      ▼                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              PostgreSQL Database                     │ │
│  │  - Cart table                                        │ │
│  │  - CartItem table                                    │ │
│  │  - Product table                                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### 1. Server vs Client Components

**Server Components** (default):
- Run on server only
- Can use `async/await` directly
- Access database, cookies, etc.
- Cannot use hooks (useState, useEffect)
- Cannot handle events (onClick, etc.)
- Examples: CartPage, CartSummary

**Client Components** (`"use client"`):
- Run in browser
- Can use React hooks
- Can handle user interactions
- Must call server actions for data changes
- Examples: CartEntry, CartCount, AddToCartButton

### 2. Server Actions

**What are they?**
- Functions marked with `"use server"`
- Run on server only
- Can be called from client components
- Secure (no API routes needed)

**Benefits**:
- Type-safe
- Automatic serialization
- Built into Next.js
- No fetch/axios needed

**Example**:
```typescript
// Server Action
"use server";
export async function addToCart(productId: string) {
  // Runs on server
  await prisma.cartItem.create({ ... });
}

// Client Component
"use client";
export function Button() {
  const handleClick = async () => {
    await addToCart("123"); // Calls server action
  };
}
```

### 3. Data Serialization

**Problem**: Prisma types (Decimal, Date) can't be sent to client

**Solution**: Create serialized types
```typescript
// Server type (has Decimal)
type ShoppingCart = { price: Decimal }

// Client type (has number)
type SerializedShoppingCart = { price: number }
```

**Conversion**:
```typescript
const serialized = {
  ...cart,
  items: cart.items.map(item => ({
    ...item,
    product: {
      ...item.product,
      price: Number(item.product.price) // Decimal → number
    }
  }))
};
```

### 4. Cookie-Based Cart Identification

**How it works**:
1. User visits site
2. Server creates cart (if needed)
3. Sets `cartId` cookie
4. Cookie persists across requests
5. Server reads cookie to find cart

**Cookie Settings**:
```typescript
cookies().set("cartId", cart.id, {
  httpOnly: true,        // JavaScript can't access (security)
  secure: true,          // HTTPS only (production)
  sameSite: "lax"        // CSRF protection
});
```

**Benefits**:
- No authentication needed
- Works for anonymous users
- Persistent across sessions
- Secure (httpOnly)

### 5. Event-Driven Updates

**Custom Event System**:
```typescript
// Dispatch event
window.dispatchEvent(new Event("cartUpdated"));

// Listen for event
window.addEventListener("cartUpdated", handler);
```

**Why use events?**
- Decouples components
- Real-time updates
- No prop drilling
- Works across page boundaries

**Flow**:
1. Action completes (add/remove/update)
2. Dispatch `cartUpdated` event
3. All listeners fire
4. Components update independently

### 6. Router Refresh Pattern

**Problem**: Server components don't auto-update

**Solution**: `router.refresh()`
```typescript
await addToCart(productId);
router.refresh(); // Forces server component re-render
```

**What it does**:
- Re-fetches server component data
- Updates page with latest data
- No full page reload

### 7. Optimistic Updates vs Server Refresh

**Current Approach**: Server Refresh
- Wait for server action
- Refresh page
- Show updated data

**Alternative**: Optimistic Updates
- Update UI immediately
- Call server action
- Revert if fails

**Why Server Refresh?**
- Simpler code
- Always accurate
- No rollback logic needed

---

## Common Patterns

### Pattern 1: Loading States
```typescript
const [isUpdating, setIsUpdating] = useState(false);

const handleAction = async () => {
  setIsUpdating(true);
  try {
    await serverAction();
  } finally {
    setIsUpdating(false);
  }
};

<Button disabled={isUpdating}>Action</Button>
```

### Pattern 2: Error Handling
```typescript
try {
  await serverAction();
} catch (error) {
  console.error("Failed:", error);
  // Could show toast notification here
}
```

### Pattern 3: Event + Refresh
```typescript
await serverAction();
window.dispatchEvent(new Event("cartUpdated"));
router.refresh();
```

### Pattern 4: Conditional Rendering
```typescript
if (!cart || cart.items.length === 0) {
  return <EmptyState />;
}
return <CartItems />;
```

---

## Best Practices

1. **Always serialize Decimal to number** before sending to client
2. **Use events for cross-component updates** (not props)
3. **Refresh router after mutations** to update server components
4. **Handle loading states** to prevent double-clicks
5. **Validate on server** (never trust client input)
6. **Use httpOnly cookies** for security
7. **Type everything** (TypeScript types for safety)
8. **Handle errors gracefully** (try/catch, fallbacks)

---

## Troubleshooting

### Images not showing after refresh
**Solution**: Use regular `<img>` tag instead of Next.js `Image` in client components

### Decimal serialization errors
**Solution**: Convert to number in `getCart()` before returning

### Cart not updating
**Solution**: Ensure `router.refresh()` is called after mutations

### Badge not updating
**Solution**: Ensure `cartUpdated` event is dispatched

### Type errors
**Solution**: Use `SerializedShoppingCart` type for client components

---

## Summary

The cart system uses:
- **Server Actions** for secure database operations
- **Client Components** for interactive UI
- **Event System** for real-time updates
- **Cookie-based** cart identification
- **Type-safe** serialization for client-server communication

This architecture provides:
- ✅ Security (server-side operations)
- ✅ Performance (optimized queries)
- ✅ Real-time updates (event system)
- ✅ Type safety (TypeScript)
- ✅ User experience (optimistic feel with server accuracy)

