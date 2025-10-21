import dayjs from 'dayjs';

export function formatDate(date: any, format: string = 'DD-MM-YYYY HH:mm') {
    return dayjs(date).format(format);
}
