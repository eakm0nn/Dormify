const { Prisma, fail } = require('./domain');
const anchorDate = (start, index) => {
    const month = start.getUTCMonth() + index,
        year = start.getUTCFullYear();
    const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, month, Math.min(start.getUTCDate(), last)));
};
const utilityItems = async (tx, roomId, from, to) => {
    if (from >= to) return [];
    const items = [];
    for (const utilityType of ['WATER', 'ELECTRICITY']) {
        const first = await tx.utilityRate.findFirst({
            where: { utilityType, effectiveFrom: { lte: from } },
            orderBy: { effectiveFrom: 'desc' },
        });
        if (!first) fail(409, 'ยังไม่มีอัตราน้ำไฟที่มีผลตั้งแต่ต้นรอบ');
        const changes = await tx.utilityRate.findMany({
            where: { utilityType, effectiveFrom: { gt: from, lt: to } },
            orderBy: { effectiveFrom: 'asc' },
        });
        const rates = [first, ...changes],
            dates = [from, ...changes.map((rate) => rate.effectiveFrom), to];
        const readings = await tx.meterReading.findMany({
            where: { roomId, utilityType, readingDate: { in: dates } },
        });
        const byDate = new Map(
            readings.map((reading) => [reading.readingDate.getTime(), reading]),
        );
        for (let index = 0; index < rates.length; index++) {
            const opening = byDate.get(dates[index].getTime()),
                closing = byDate.get(dates[index + 1].getTime()),
                rate = rates[index];
            if (!opening || !closing)
                fail(409, 'ต้องมีเลขมิเตอร์จริงครบต้นรอบ ปลายรอบ และทุกวันที่เปลี่ยนอัตรา');
            const quantity = closing.value.sub(opening.value);
            if (quantity.lt(0)) fail(409, 'เลขมิเตอร์สะสมปลายช่วงน้อยกว่าต้นช่วง');
            items.push({
                itemType: utilityType,
                quantity,
                unitPrice: rate.unitPrice,
                amount: quantity
                    .mul(rate.unitPrice)
                    .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP),
                openingValue: opening.value,
                closingValue: closing.value,
                sourceReference: rate.sourceReference,
                periodStart: dates[index],
                periodEnd: dates[index + 1],
                readingStartId: opening.id,
                readingEndId: closing.id,
            });
        }
    }
    return items;
};
const rentUntil = (lease, checkout) => {
    let amount = new Prisma.Decimal(0),
        index = 0;
    const details = [];
    while (anchorDate(lease.startDate, index) < checkout) {
        if (index > 1200) fail(400, 'ระยะสัญญาเกินช่วงที่รองรับ');
        const from = anchorDate(lease.startDate, index),
            next = anchorDate(lease.startDate, index + 1);
        const to = checkout < next ? checkout : next;
        const days = (to - from) / 86400000,
            cycleDays = (next - from) / 86400000;
        const rent = lease.monthlyRent
            .mul(days)
            .div(cycleDays)
            .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
        amount = amount.add(rent);
        details.push({
            from,
            to,
            days,
            cycleDays,
            monthlyRent: lease.monthlyRent.toString(),
            amount: rent.toString(),
        });
        index++;
    }
    return { amount, details };
};
module.exports = { anchorDate, utilityItems, rentUntil };
