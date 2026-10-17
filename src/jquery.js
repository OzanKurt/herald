/**
 * Drop-in for SmartAdmin's SmartNotification plugin: defines $.smallBox,
 * $.bigBox and $.SmartMessageBox on the page's jQuery, so legacy calls work
 * unchanged. Legacy `title` and `content` are HTML, as they were in
 * SmartAdmin; alerts ignore Escape, as they did there; `sound` is accepted and
 * ignored. Also exposes window.Herald.
 */

import Herald from './index.js';

const $ = window.jQuery;

if ($) {
    $.smallBox = (settings = {}, callback) => Herald.toast({
        titleHtml: settings.title,
        html: settings.content,
        color: settings.color,
        icon: settings.icon,
        iconSmall: settings.iconSmall,
        timeout: settings.timeout,
        onClose: callback,
    });

    $.bigBox = (settings = {}, callback) => Herald.panel({
        titleHtml: settings.title,
        html: settings.content,
        color: settings.color,
        icon: settings.icon,
        number: settings.number,
        timeout: settings.timeout,
        onClose: callback,
    });

    $.SmartMessageBox = (settings = {}, callback) => Herald.alert({
        titleHtml: settings.title,
        html: settings.content,
        buttons: settings.buttons,
        input: settings.input,
        inputValue: settings.inputValue,
        placeholder: settings.placeholder,
        options: settings.options,
        // SmartAdmin had no Escape; legacy callbacks only ever receive a button label.
        dismissible: false,
    }, callback);
} else {
    console.warn('[Herald] jQuery was not found when herald.jquery.js loaded, so $.smallBox, $.bigBox and $.SmartMessageBox are not defined. Load jQuery first.');
}

window.Herald = Herald;

export default Herald;
