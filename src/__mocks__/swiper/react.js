const React = require('react');

exports.Swiper = ({ children, ...props }) => React.createElement('div', props, children);
exports.SwiperSlide = ({ children, ...props }) => React.createElement('div', props, children);
