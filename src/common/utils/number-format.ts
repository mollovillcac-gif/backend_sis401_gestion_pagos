export function numberFormat(numero: any) {
    let num = Number(numero) || 0;
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
