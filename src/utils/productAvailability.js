// Single source of truth for how a product's availability reads on the site.
//
// Both stock states deliberately render the same way: the change request
// asked for "In stock" and "On order" to be replaced with one
// "Available · 3-5 days" line. The underlying `stock` value is still stored
// and still editable in the admin panel, so if the two ever need to read
// differently again, that's a change to this map alone — every place that
// displays availability goes through here.
const AVAILABILITY_LABEL = {
  in: "Available · 3-5 days",
  order: "Available · 3-5 days",
};
 
export function availabilityLabel(stock) {
  return AVAILABILITY_LABEL[stock] || AVAILABILITY_LABEL.in;
}