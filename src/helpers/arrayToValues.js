/**
 *  Get the privilages by using type
 * @param {String} type
 * @returns {Boolean} true or false
 */
const arrayToValues = (privileges) => {
    let values = {};
    privileges?.categories?.map(({ name }) => {
        values[name] = true;
    });
    return values;
};

export default arrayToValues;
