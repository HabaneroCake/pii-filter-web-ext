export function calc_array_diff<T>(
    arr_new: Array<T>,
    arr_old: Array<T>,
    equal: (lhs: T, rhs: T) => boolean
): {added: Array<T>, removed: Array<T>}
{
    return {
        added: arr_new.filter(
            (new_element: T) => !arr_old.some((old_element: T) => equal(new_element, old_element))
        ),
        removed: arr_old.filter(
            (old_element: T) => !arr_new.some((new_element: T) => equal(new_element, old_element))
        ),
    };
};