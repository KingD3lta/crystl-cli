export const dedup = (inputArray) => {
    var seen = {};
    return inputArray.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}
