const filtrationList = document.querySelector('.filtration__list');
const checkboxes = document.querySelectorAll('.filtration__input');
const cheapestButton = document.querySelector('.button_cheapest');
const fastestButton = document.querySelector('.button_fastest');
const ticket = document.querySelector('.tickets__item');
const ticketsList = document.querySelector('.tickets__list');

const COUNT_OF_TICKETS = 5;

const getData = (onSuccess) => {
  fetch('http://localhost:3000/tickets')
    .then((res) => res.json())
    .then((data) => onSuccess(data));
};

getData((tickets) => showTickets(tickets));

const convertTimeToHours = (minutes) => {
  let hours = Math.trunc(minutes / 60);
  let mins = minutes % 60;

  return `${hours}ч ${mins}м`;
};

const renderTicketsList = (data) => {
  data.forEach((el) => {
    const ticketEl = ticket.cloneNode(true);

    ticketEl.querySelector('.ticket__price').textContent = `${el.price} Р`;

    const elementLogo = el.carrier;

    ticketEl.querySelector('.ticket__logo').src = `http://pics.avs.io/99/36/${elementLogo}.png`;

    const flightTime = convertTimeToHours(el.segments[0].duration);
    const flightTimeBack = convertTimeToHours(el.segments[1].duration);

    ticketEl.querySelectorAll('.ticket-description__flight-time')[0].textContent = flightTime;

    ticketEl.querySelectorAll('.ticket-description_from')[0].textContent = el.segments[0].origin;
    ticketEl.querySelectorAll('.ticket-description_to')[0].textContent = el.segments[0].destination;
    ticketEl.querySelectorAll('.ticket-description__stops')[0].textContent = el.segments[0].stops;

    if (el.segments[0].stops.length === 0) {
      ticketEl.querySelectorAll('.ticket-description__transfer')[0].textContent = 'Без пересадок';
    }
    if (el.segments[0].stops.length === 1) {
      ticketEl.querySelectorAll('.ticket-description__transfer')[0].textContent = '1 пересадка';
    }
    if (el.segments[0].stops.length === 3) {
      ticketEl.querySelectorAll('.ticket-description__transfer')[0].textContent = '3 пересадки';
    }

    ticketEl.querySelectorAll('.ticket-description__flight-time')[1].textContent = flightTimeBack;
    ticketEl.querySelectorAll('.ticket-description_from')[1].textContent = el.segments[1].origin;
    ticketEl.querySelectorAll('.ticket-description_to')[1].textContent = el.segments[1].destination;
    ticketEl.querySelectorAll('.ticket-description__stops')[1].textContent = el.segments[1].stops;

    if (el.segments[1].stops.length === 0) {
      ticketEl.querySelectorAll('.ticket-description__transfer')[1].textContent = 'Без пересадок';
    }
    if (el.segments[1].stops.length === 1) {
      ticketEl.querySelectorAll('.ticket-description__transfer')[1].textContent = '1 пересадка';
    }
    if (el.segments[1].stops.length === 3) {
      ticketEl.querySelectorAll('.ticket-description__transfer')[1].textContent = '3 пересадки';
    }

    ticketsList.appendChild(ticketEl);
  });

  const allTickets = document.querySelectorAll('.tickets__item');

  for (let i = COUNT_OF_TICKETS; i < data.length; i += 1) {
    allTickets[i].classList.add('visually-hidden');
  }
};

const sortTicketsByPrice = (data) => {
  ticketsList.innerHTML = '';

  const clonedData = data.slice(0);
  const sortedData = clonedData.sort((a, b) => a.price - b.price);

  return sortedData;
};

const sortTicketsByDuration = (data) => {
  ticketsList.innerHTML = '';

  const copiedData = data.slice(0);
  const sortedFastest = copiedData.sort(
    (a, b) =>
      a.segments[0].duration +
      a.segments[1].duration -
      b.segments[0].duration -
      b.segments[1].duration,
  );

  return sortedFastest;
};

const getTicketsByTransfers = (data, count1, count2, count3) => {
  const filteredTickets = data.filter(
    (item) =>
      (item.segments[0].stops.length === count1 ||
        item.segments[0].stops.length === count2 ||
        item.segments[0].stops.length === count3) &&
      (item.segments[1].stops.length === count1 ||
        item.segments[1].stops.length === count2 ||
        item.segments[1].stops.length === count3),
  );

  return filteredTickets;
};

const getTicketsbyPrice = (data, count1, count2, count3) => {
  const tickets = sortTicketsByPrice(data);
  const allTickets = getTicketsByTransfers(tickets, count1, count2, count3);
  const renderedList = renderTicketsList(allTickets);

  return renderedList;
};

const getTicketsbyDuration = (data, count1, count2, count3) => {
  const tickets = sortTicketsByDuration(data);
  const allTickets = getTicketsByTransfers(tickets, count1, count2, count3);
  const renderedList = renderTicketsList(allTickets);

  return renderedList;
};

const showTickets = (items) => {
  cheapestButton.addEventListener('click', () => {
    fastestButton.classList.remove('button_active');
    cheapestButton.classList.add('button_active');
    showAllTickets();
  });

  fastestButton.addEventListener('click', () => {
    cheapestButton.classList.remove('button_active');
    fastestButton.classList.add('button_active');
    showAllTickets();
  });

  const showAllTickets = () => {
    const selectedCheckboxes = document.querySelectorAll('.filtration__input:checked');
    const checkedValues = Array.from(selectedCheckboxes).map((item) => item.id);

    if (checkedValues.length === 0) {
      ticketsList.innerHTML = '';
    }
    if (checkedValues[0] === 'all' && cheapestButton.classList.contains('button_active')) {
      let tickets = sortTicketsByPrice(items);
      renderTicketsList(tickets);
    }
    if (checkedValues[0] === 'all' && fastestButton.classList.contains('button_active')) {
      let fastTickets = sortTicketsByDuration(items);
      renderTicketsList(fastTickets);
    }
    if (
      checkedValues[0] === 'without-transfer' &&
      cheapestButton.classList.contains('button_active')
    ) {
      getTicketsbyPrice(items, 0);
    }
    if (
      checkedValues[0] === 'without-transfer' &&
      !checkboxes[4].checked &&
      fastestButton.classList.contains('button_active')
    ) {
      getTicketsbyDuration(items, 0);
    }
    if (
      checkedValues[0] === 'one-transfer' &&
      !checkboxes[4].checked &&
      !checkboxes[4].checked &&
      cheapestButton.classList.contains('button_active')
    ) {
      getTicketsbyPrice(items, 1);
    }
    if (checkedValues[0] === 'one-transfer' && fastestButton.classList.contains('button_active')) {
      getTicketsbyDuration(items, 1);
    }
    if (
      checkedValues[0] === 'two-transfers' &&
      !checkboxes[4].checked &&
      cheapestButton.classList.contains('button_active')
    ) {
      getTicketsbyPrice(items, 2);
    }
    if (checkedValues[0] === 'two-transfers' && fastestButton.classList.contains('button_active')) {
      getTicketsbyDuration(items, 2);
    }
    if (
      checkedValues[0] === 'three-transfers' &&
      cheapestButton.classList.contains('button_active')
    ) {
      getTicketsbyPrice(items, 3);
    }
    if (
      checkedValues[0] === 'three-transfers' &&
      fastestButton.classList.contains('button_active')
    ) {
      getTicketsbyDuration(items, 3);
    }
    if (
      checkedValues[0] === 'without-transfer' &&
      checkedValues[1] === 'one-transfer' &&
      cheapestButton.classList.contains('button_active')
    ) {
      getTicketsbyPrice(items, 0, 1);
    }
    if (
      checkedValues[0] === 'without-transfer' &&
      checkedValues[1] === 'one-transfer' &&
      fastestButton.classList.contains('button_active')
    ) {
      getTicketsbyDuration(items, 0, 1);
    }
    if (
      checkedValues[0] === 'without-transfer' &&
      checkedValues[1] === 'two-transfers' &&
      cheapestButton.classList.contains('button_active')
    ) {
      getTicketsbyPrice(items, 0, 2);
    }
    if (
      checkedValues[0] === 'without-transfer' &&
      checkedValues[1] === 'two-transfers' &&
      fastestButton.classList.contains('button_active')
    ) {
      getTicketsbyDuration(items, 0, 2);
    }
    if (
      checkedValues[0] === 'without-transfer' &&
      checkedValues[1] === 'three-transfers' &&
      cheapestButton.classList.contains('button_active')
    ) {
      getTicketsbyPrice(items, 0, 3);
    }
    if (
      checkedValues[0] === 'without-transfer' &&
      checkedValues[1] === 'three-transfers' &&
      fastestButton.classList.contains('button_active')
    ) {
      getTicketsbyDuration(items, 0, 3);
    }
    if (
      checkedValues[0] === 'one-transfer' &&
      checkedValues[1] === 'two-transfers' &&
      cheapestButton.classList.contains('button_active')
    ) {
      getTicketsbyPrice(items, 1, 2);
    }
    if (
      checkedValues[0] === 'one-transfer' &&
      checkedValues[1] === 'two-transfers' &&
      fastestButton.classList.contains('button_active')
    ) {
      getTicketsbyDuration(items, 1, 2);
    }
    if (
      checkedValues[0] === 'one-transfer' &&
      checkedValues[1] === 'three-transfers' &&
      cheapestButton.classList.contains('button_active')
    ) {
      getTicketsbyPrice(items, 1, 3);
    }
    if (
      checkedValues[0] === 'one-transfer' &&
      checkedValues[1] === 'three-transfers' &&
      fastestButton.classList.contains('button_active')
    ) {
      getTicketsbyDuration(items, 1, 3);
    }
    if (
      checkedValues[0] === 'two-transfers' &&
      checkedValues[1] === 'three-transfers' &&
      cheapestButton.classList.contains('button_active')
    ) {
      getTicketsbyPrice(items, 2, 3);
    }
    if (
      checkedValues[0] === 'two-transfers' &&
      checkedValues[1] === 'three-transfers' &&
      fastestButton.classList.contains('button_active')
    ) {
      getTicketsbyDuration(items, 2, 3);
    }
    if (
      checkedValues[0] === 'one-transfer' &&
      checkedValues[1] === 'two-transfers' &&
      checkedValues[2] === 'three-transfers' &&
      cheapestButton.classList.contains('button_active')
    ) {
      getTicketsbyPrice(items, 1, 2, 3);
    }
    if (
      checkedValues[0] === 'one-transfer' &&
      checkedValues[1] === 'two-transfers' &&
      checkedValues[2] === 'three-transfers' &&
      fastestButton.classList.contains('button_active')
    ) {
      getTicketsbyDuration(items, 1, 2, 3);
    }
    if (
      checkedValues[0] === 'without-transfer' &&
      checkedValues[1] === 'one-transfer' &&
      checkedValues[2] === 'two-transfers' &&
      checkedValues[3] === 'three-transfers' &&
      cheapestButton.classList.contains('button_active')
    ) {
      let ticketsAll = sortTicketsByPrice(items);
      renderTicketsList(ticketsAll);
    }
    if (
      checkedValues[0] === 'without-transfer' &&
      checkedValues[1] === 'one-transfer' &&
      checkedValues[2] === 'two-transfers' &&
      checkedValues[3] === 'three-transfers' &&
      fastestButton.classList.contains('button_active')
    ) {
      let fastTicketsAll = sortTicketsByDuration(items);
      renderTicketsList(fastTicketsAll);
    }
  };

  filtrationList.addEventListener('change', showAllTickets);
};
