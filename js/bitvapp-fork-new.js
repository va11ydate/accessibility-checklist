$(document).ready(function() {
    // JSON von externer URL laden
    $.getJSON('https://vodafone-de.github.io/accessibility-checklist/data/data.json', function(jsonArray) {
        // Objekte nach Kategorien gruppieren
        const groupedByCategory = {};
        jsonArray.forEach(item => {
            const category = item.category;
            if (!groupedByCategory[category]) {
                groupedByCategory[category] = [];
            }
            groupedByCategory[category].push(item);
        });

        // Variablen für Zähler initialisieren
        let fieldsetCount = 0;
        let selectedRadioCount = 0;
        let passCount = 0;
        let failCount = 0;

        // Funktion zur Aktualisierung des Zählers und der Prozente
        function updateCounter() {
            const totalSelected = passCount + failCount;
            const passPercentage = totalSelected > 0 ? (passCount / totalSelected * 100).toFixed(2) : 0;
            const failPercentage = totalSelected > 0 ? (failCount / totalSelected * 100).toFixed(2) : 0;
            $('#counter').html(`
                <p>Zu erledigende Tasks: ${fieldsetCount}</p>
                <p>Anzahl erledigte Tasks: ${selectedRadioCount}</p>
                <p>Pass: ${passCount} (${passPercentage}%)</p>
                <div class="progress">
                    <div class="progress-bar pass" style="width: ${passPercentage}%;">${passPercentage}%</div>
                </div>
                <p>Fail: ${failCount} (${failPercentage}%)</p>
                <div class="progress">
                    <div class="progress-bar fail" style="width: ${failPercentage}%;">${failPercentage}%</div>
                </div>
            `);
        }

        // Für jede Kategorie HTML erstellen und anhängen
        Object.keys(groupedByCategory).forEach(category => {
            const container = $('<div>').addClass('ws10-card'); // Klasse "ws10-card" hinzufügen

            // Accordion Header
            const accordionHeader = $('<div>').addClass('accordion-header');
            const accordionTitle = $('<h3>').text(category).addClass('accordion-title');

            // SVG für Accordion Toggle
            const accordionToggle = $('<div>').addClass('accordion-toggle');
            const svg = $('<svg class="ws10-accordion-item__chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><polyline class="st0" points="164 62 96 130 28 62" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"></polyline></svg>');
            accordionToggle.append(svg);

            accordionHeader.append(accordionTitle).append(accordionToggle);
            container.append(accordionHeader);

            // Accordion Content
            const accordionContent = $('<div>').addClass('accordion-content').css('max-height', '0');
            groupedByCategory[category].forEach(item => {
                const innerDiv = $('<div>').attr('id', item.id);
                innerDiv.append(`<span>${item.bitv}</span>`);
                innerDiv.append(`<h4>${item.title}</h4>`);
                const badgeGroup = $('<div>').addClass('badgegroup');
                item.roles.forEach(role => {
                    badgeGroup.append(`<span class="${role}_filter">${role}</span>`);
                });
                innerDiv.append(badgeGroup);
                if (item.dods) { // Überprüfen, ob dods existiert
                    const dodsDiv = $('<div>').addClass('dods');
                    Object.keys(item.dods).forEach(taskType => {
                        const ul = $('<ul>').addClass(taskType + 'tasks');
                        item.dods[taskType].forEach(task => {
                            const li = $('<li>').attr('id', task.taskid);
                            li.append($('<h5>').addClass('taskdesc').text(task.taskdesc));
                            li.append($('<span>').addClass('tasktype').text(task.tasktype));
                            const taskCatDiv = $('<div>').addClass('taskcat');
                            task.taskcat.forEach(cat => {
                                taskCatDiv.append($('<span>').text(cat));
                            });
                            li.append(taskCatDiv);
                            li.append($('<div>').addClass('testtool').text(task.testtool));
                            li.append($('<div>').addClass('testmethod').text(task.testmethod));
                            const fieldset = $('<fieldset>').addClass('status-options');
                            const radioLegend = $('<legend>').text('compliance');
                            const passRadio = $('<input>').attr({type: 'radio', name: 'status_' + task.taskid, id: 'pass_' + task.taskid, value: 'pass'});
                            const passLabel = $('<label>').attr('for', 'pass_' + task.taskid).text('pass');
                            const failRadio = $('<input>').attr({type: 'radio', name: 'status_' + task.taskid, id: 'fail_' + task.taskid, value: 'fail'});
                            const failLabel = $('<label>').attr('for', 'fail_' + task.taskid).text('fail');

                            // Event-Handler für die Radio Buttons
                            passRadio.on('change', function() {
                                const fieldset = $(this).closest('fieldset');
                                const wasChecked = fieldset.data('wasChecked');

                                if ($(this).is(':checked')) {
                                    if (wasChecked === 'fail') {
                                        failCount--;
                                    }
                                    passCount++;
                                    if (!fieldset.data('isChecked')) {
                                        selectedRadioCount++;
                                        fieldsetCount--;
                                    }
                                    fieldset.data('wasChecked', 'pass');
                                    fieldset.data('isChecked', true);
                                }
                                updateCounter();
                            });

                            failRadio.on('change', function() {
                                const fieldset = $(this).closest('fieldset');
                                const wasChecked = fieldset.data('wasChecked');

                                if ($(this).is(':checked')) {
                                    if (wasChecked === 'pass') {
                                        passCount--;
                                    }
                                    failCount++;
                                    if (!fieldset.data('isChecked')) {
                                        selectedRadioCount++;
                                        fieldsetCount--;
                                    }
                                    fieldset.data('wasChecked', 'fail');
                                    fieldset.data('isChecked', true);
                                }
                                updateCounter();
                            });

                            // Reset Button hinzufügen
                            const resetButton = $('<button>').addClass('reset-button');
                            const resetSvg = $('<svg>').html('<svg xmlns="http://www.w3.org/2000/svg"><image href="img/refresh-system.svg" /></svg>').addClass('reset-button-icon');
                            resetButton.append(resetSvg);
                            resetButton.on('click', function() {
                                if (passRadio.is(':checked') || failRadio.is(':checked')) {
                                    if (passRadio.is(':checked')) {
                                        passCount--;
                                    } else {
                                        failCount--;
                                    }
                                    selectedRadioCount--;
                                    fieldsetCount++;
                                    passRadio.prop('checked', false);
                                    failRadio.prop('checked', false);
                                    fieldset.data('wasChecked', null);
                                    fieldset.data('isChecked', false);
                                    updateCounter();
                                }
                            });

                            fieldset.append(radioLegend, passRadio, passLabel, failRadio, failLabel, resetButton);
                            li.append(fieldset);

                            const applicableCheckbox = $('<input>').attr({type: 'checkbox', id: 'applicable_' + task.taskid, name: 'applicable_' + task.taskid, checked: true});
                            const applicableLabel = $('<label>').attr('for', 'applicable_' + task.taskid).text('applicable');

                            // Checkbox in Switch verwandeln
                            const switchWrapper = $('<div>').addClass('switch');
                            const slider = $('<span>').addClass('slider');
                            switchWrapper.append(applicableCheckbox, slider);
                            li.append(switchWrapper, applicableLabel);

                            // Eventlistener für applicable Checkbox
                            applicableCheckbox.on('change', function() {
                                const isChecked = $(this).is(':checked');
                                const wasChecked = $(this).closest('li').find('input[type="radio"]:checked').val();
                                const fieldset = $(this).closest('li').find('fieldset');

                                if (isChecked) {
                                    fieldset.prop('disabled', false);
                                    if (fieldset.data('wasUnchecked')) {
                                        if (wasChecked === 'pass') {
                                            passCount++;
                                        } else if (wasChecked === 'fail') {
                                            failCount++;
                                        }
                                        selectedRadioCount++;
                                        fieldset.data('wasUnchecked', false);
                                    }
                                    if (!fieldset.data('isChecked') && !wasChecked) {
                                        fieldsetCount++;
                                    }
                                } else {
                                    if (!wasChecked) {
                                        fieldsetCount--;
                                    }
                                    fieldset.prop('disabled', true);
                                    if (selectedRadioCount > 0 && wasChecked) {
                                        selectedRadioCount--;
                                        fieldset.data('wasUnchecked', true);
                                        if (wasChecked === 'pass') {
                                            passCount--;
                                        } else if (wasChecked === 'fail') {
                                            failCount--;
                                        }
                                    }
                                }
                                updateCounter();
                            });

                            // Eventlistener für switchWrapper hinzufügen
                            switchWrapper.on('click', function() {
                                applicableCheckbox.prop('checked', !applicableCheckbox.prop('checked')).trigger('change');
                            });

                            ul.append(li);
                            fieldsetCount++; // Zähler für Fieldset erhöhen
                        });
                        dodsDiv.append(ul);
                    });
                    innerDiv.append(dodsDiv);
                }
                accordionContent.append(innerDiv);
            });
            container.append(accordionContent);

            // Accordion Header Klick-Event
            accordionHeader.click(function() {
                const chevron = $(this).find('.ws10-accordion-item__chevron');
                chevron.toggleClass('rotate');
                accordionContent.toggleClass('open');

                if (accordionContent.hasClass('open')) {
                    accordionContent.css('max-height', accordionContent[0].scrollHeight + 'px');
                } else {
                    accordionContent.css('max-height', '0');
                }
            });

            $('body').append(container);
        });

        // Separates div für Zähler hinzufügen
        $('body').append($('<div>').attr('id', 'counter'));
        updateCounter();
    });
});
