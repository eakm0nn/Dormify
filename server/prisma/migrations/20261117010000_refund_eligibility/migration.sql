-- Preserve historical adjustments as unknown (NULL); never infer a refund entitlement.
ALTER TABLE `InvoiceAdjustment` ADD COLUMN `refundEligible` BOOLEAN NULL;
