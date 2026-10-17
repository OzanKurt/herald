/**
 * Drop-in for SmartAdmin's SmartNotification plugin: defines $.smallBox,
 * $.bigBox and $.SmartMessageBox on the page's jQuery, so legacy calls work
 * unchanged. Legacy `content` is HTML, as it was in SmartAdmin; `sound` is
 * accepted and ignored. Also exposes window.Herald.
 */

import Herald from './index.js';

const $ = window.jQuery;

if ($) {
    $.smallBox = (settings = {}, callback) => Herald.toast({
        title: settings.title,
        html: settings.content,
        color: settings.color,
        icon: settings.icon,
        iconSmall: settings.iconSmall,
        timeout: settings.timeout,
        onClose: callback,
    });

    $.bigBox = (settings = {}, callback) => Herald.panel({
        title: settings.title,
        html: settings.content,
        color: settings.color,
        icon: settings.icon,
        number: settings.number,
        timeout: settings.timeout,
        onClose: callback,
    });

    $.SmartMessageBox = (settings = {}, callback) => Herald.alert({
        title: settings.title,
        html: settings.content,
        buttons: settings.buttons,
        input: settings.input,
        inputValue: settings.inputValue,
        placeholder: settings.placeholder,
        options: settings.options,
    }, callback);
}

window.Herald = Herald;

export default Herald;
