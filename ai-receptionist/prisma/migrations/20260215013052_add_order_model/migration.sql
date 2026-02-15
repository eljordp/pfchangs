-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('CATERING', 'CORPORATE_EVENT', 'BULK_ORDER', 'VENDOR_PURCHASE', 'GIFT_CARD_BULK', 'OTHER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "callSessionId" TEXT,
    "chatSessionId" TEXT,
    "callerId" TEXT,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "items" JSONB NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "guestCount" INTEGER,
    "eventDate" TIMESTAMP(3),
    "deliveryAddress" TEXT,
    "specialNotes" TEXT,
    "timeToOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_callSessionId_idx" ON "Order"("callSessionId");

-- CreateIndex
CREATE INDEX "Order_chatSessionId_idx" ON "Order"("chatSessionId");

-- CreateIndex
CREATE INDEX "Order_callerId_idx" ON "Order"("callerId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_type_idx" ON "Order"("type");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_callSessionId_fkey" FOREIGN KEY ("callSessionId") REFERENCES "CallSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "ChatSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "Caller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
