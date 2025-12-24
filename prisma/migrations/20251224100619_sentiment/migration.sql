-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "sentiment" TEXT DEFAULT 'neutral',
ADD COLUMN     "sentimentScore" INTEGER DEFAULT 0;
