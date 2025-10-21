export function toBoolean(value: any): boolean | any {
    if (value === 'true' || value === '1' || value === 1) {
        return true;
    } else if (value === 'false' || value === '0' || value === 0) {
        return false;
    }
    return value;
}
