export const getExpectedDeliveryDate = (daysToAdd: number = 0) => {
  // Get today's date
  const today = new Date();

  // Add the number of days you want to today's date
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + daysToAdd);

  // Format the date
  const formattedDate = futureDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return formattedDate;
};

export const getExpectedDeliveryTime = (
  expectedDeliveryTime: string,
  createdDate: string
) => {
  const restaurantDeliveryTime = expectedDeliveryTime || "30";
  const orderPayedDate = new Date(createdDate);

  orderPayedDate.setMinutes(
    orderPayedDate.getMinutes() + parseInt(restaurantDeliveryTime)
  );

  const deliveryHours = orderPayedDate.getHours();
  const deliveryMinutes = orderPayedDate.getMinutes();
  const formattedMinutes =
    deliveryMinutes < 10 ? `0${deliveryMinutes}` : deliveryMinutes;

  const deliveryTime = `${deliveryHours}:${formattedMinutes}`;

  return deliveryTime;
};
