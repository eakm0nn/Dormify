-- Expand capacity so a rent snapshot supports the same range as Lease.monthlyRent.
ALTER TABLE `InvoiceItem` MODIFY `unitPrice` DECIMAL(18,6) NOT NULL;
