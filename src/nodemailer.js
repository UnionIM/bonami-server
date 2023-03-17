import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.FROM_PASSWORD,
  },
});

export const createMailOptions = (
  name,
  delivery,
  createdAt,
  socialMedia,
  email,
  phoneNumber
) => {
  return {
    from: process.env.FROM_EMAIL,
    to: process.env.TO_EMAIL,
    subject: 'New order was created',
    text: 'Time to visit admin panel',
    html:
      '<!DOCTYPE html> <html lang="en"> <head> <title>New order</title> <link rel="preconnect" href="https://fonts.googleapis.com"> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet"> <style> .im{ color: black} </style> </head> <body style=\' font-family: Roboto,serif; margin: 50px 100px; padding: 32px; background-color:white; box-shadow: 0 0 5px #808080; border-radius: 8px; color: black \'>' +
      "<h1 style='margin: 0'>" +
      'New order from:' +
      '</h1>' +
      "<h1 style='margin-top: 0'>" +
      name.firstName +
      ' ' +
      name.secondName +
      '</h1>' +
      '<p>' +
      createdAt +
      '</p>' +
      '<p>' +
      delivery.country +
      ', ' +
      delivery.city +
      ',  ' +
      delivery.region +
      ', ' +
      delivery.street +
      ', ' +
      delivery.address +
      '</p>' +
      '<ul>' +
      "<li style='display: flex; align-items: center; margin-top: 10px'>" +
      "<img src='https://zeevector.com/wp-content/uploads/Phone-Icon-Vector-PNG.png' alt='phone' style='width: 30px; height: 30px'/>" +
      "<span style='margin: 5px 0 0 10px'>" +
      (phoneNumber || 'N/A') +
      '' +
      '</li>' +
      "<li style='display: flex; align-items: center; gap: 10px; margin-top: 10px'>" +
      "<img src='https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/240px-Telegram_logo.svg.png' alt='tg' style='width: 30px; height: 30px'/>" +
      "<span style='margin: 5px 0 0 10px'>" +
      (socialMedia.telegram || 'N/A') +
      '</span>' +
      '</li>' +
      "<li style='display: flex; align-items: center; gap: 10px; margin-top: 10px'>" +
      "<img src='https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/2560px-Gmail_icon_%282020%29.svg.png' alt='email' style='width: 30px; height: 30px'/>" +
      "<span style='margin: 5px 0 0 10px'>" +
      (email || 'N/A') +
      '</span>' +
      '</li>' +
      "<li style='display: flex; align-items: center; gap: 10px; margin-top: 10px'>" +
      "<img src='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/240px-Instagram_logo_2016.svg.png' alt='inst' style='width: 30px; height: 30px'/>" +
      "<span style='margin: 5px 0 0 10px'>" +
      (socialMedia.instagram || 'N/A') +
      '</span>' +
      '</li>' +
      "<li style='display: flex; align-items: center; gap: 10px; margin-top: 10px'>" +
      "<img src='https://cdn-icons-png.flaticon.com/512/3128/3128336.png' alt='viber' style='width: 30px; height: 30px'/>" +
      "<span style='margin: 5px 0 0 10px'>" +
      (socialMedia.viber || 'N/A') +
      '</span>' +
      '</li>' +
      "<li style='display: flex; align-items: center; gap: 10px; margin-top: 10px'>" +
      "<img src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png' alt='fcbk' style='width: 30px; height: 30px'/>" +
      "<span style='margin: 5px 0 0 10px'>" +
      (socialMedia.facebook || 'N/A') +
      '</span>' +
      '</li>' +
      '</ul>' +
      '</body> </html>',
  };
};
