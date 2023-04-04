import { useEffect } from "react";

export const YooMoneyCheckout = () => {
  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://yookassa.ru/checkout-widget/v1/checkout-widget.js";
    script.async = true;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Инициализация виджета. Все параметры обязательные.
    const checkout = new (window as any).YooMoneyCheckoutWidget({
      confirmation_token: "test_0JD78YUawQtnWpK-hXo6PxkMy1_DKryZ0MzxN5z4OG0", //Токен, который перед проведением оплаты нужно получить от ЮKassa
      return_url: "https://example.com", //Ссылка на страницу завершения оплаты

      colors: {background: '#0154f9'},
      error_callback: function (error : any) {
        //Обработка ошибок инициализации
        console.log(error)
      },
    });
    
    // Отображение платежной формы в контейнере
    checkout
      .render("payment-form")
      // Метод возвращает Promise, исполнение которого говорит о полной загрузке платежной формы (можно не использовать).
      .then(() => {
        // Код, который нужно выполнить после отображения платежной формы.
      });
  }, []);

  return (
    <>
        <div id="payment-form"></div>
        <p>Данные банковской карты для оплаты в <b>тестовом магазине</b>:</p>
        <ul>
         <li>номер — <b>5555 5555 5555 4477</b></li>
         <li>срок действия — <b>01/30</b> (или другая дата, больше текущей)</li>
         <li>CVC — <b>123</b> (или три любые цифры)</li>
         <li>код для прохождения 3-D Secure — <b>123</b> (или три любые цифры)</li>
        </ul>
   </>
  );
};
