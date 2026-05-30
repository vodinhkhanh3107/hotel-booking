

export const getDetailBill = (dates,room,selectedDiscount) => {
    console.log(dates)
    let nights = 0;
    if (dates && dates[0] && dates[1]) {
      nights = dates[1].startOf('day').diff(dates[0].startOf('day'), 'day');
    }
    const actualNights = nights > 0 ? nights : 0;
    const subTotal = (room?.price || 0) * actualNights;
    
    let discountAmount = 0;
    if (selectedDiscount) {
      discountAmount = (subTotal * (selectedDiscount.discount_percent || 0)) / 100;
    }

    const totalBeforeTax = Math.max(0, subTotal - discountAmount);
    const tax = totalBeforeTax * 0.05; 
    const total = totalBeforeTax + tax;
    
    return { nights: actualNights, subTotal, discountAmount, tax, total };
}