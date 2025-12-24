import {
  getSalesRevenueData,
  getOrdersCountData,
  getTopProductsData,
  getRevenueByCategoryData,
  getOrderStatusData,
} from "@/lib/chart";
import { ChartsClient } from "./ChartsClient";

const Charts = async () => {
  const [
    salesRevenueData,
    ordersCountData,
    topProductsData,
    revenueByCategoryData,
    orderStatusData,
  ] = await Promise.all([
    getSalesRevenueData(),
    getOrdersCountData(),
    getTopProductsData(),
    getRevenueByCategoryData(),
    getOrderStatusData(),
  ]);

  return (
    <ChartsClient
      salesRevenueData={salesRevenueData}
      ordersCountData={ordersCountData}
      topProductsData={topProductsData}
      revenueByCategoryData={revenueByCategoryData}
      orderStatusData={orderStatusData}
    />
  );
};

export default Charts;
