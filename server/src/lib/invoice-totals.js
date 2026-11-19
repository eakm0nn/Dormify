const { Prisma } = require('./domain');
const total = (invoice) =>
    (invoice.adjustments || []).reduce(
        (sum, row) => sum.add(row.amount),
        new Prisma.Decimal(invoice.totalAmount),
    );
const presentInvoice = (invoice) => ({
    ...invoice,
    amountDue: total(invoice).toString(),
});
module.exports = { total, presentInvoice };
