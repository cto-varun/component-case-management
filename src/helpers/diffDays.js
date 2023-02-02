import moment from 'moment';

export default function diffDays(date) {
    let a = moment(new Date(date), 'M/D/YYYY');
    let b = moment(new Date(), 'M/D/YYYY');
    let diffDays = b.diff(a, 'days');
    return diffDays;
}
