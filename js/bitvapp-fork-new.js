$(document).ready(function() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    $(function() {
        if (prefersDark) {
            $('body').addClass('dark');
            $('.dark-mode-switcher').text('Dark mode OFF');
        }
        $('.dark-mode-switcher').on('click', function(e) {
            $('body').toggleClass('dark');

            if ($('body').hasClass('dark')) {
                $('.dark-mode-switcher').text('Dark mode OFF'); 
            } else {
                $('.dark-mode-switcher').text('Dark mode ON');
            }
            e.preventDefault();
        });
    });

    // Funktion zum Aktualisieren des Query-Strings
    function updateQueryString() {
        const selectedFilters = $('#filter-options input[type="checkbox"]:checked').map(function() {
            return $(this).data('filter_id');
        }).get();

        const queryString = selectedFilters.length > 0 ? `?filters=${selectedFilters.join('%2C')}` : '';
        history.replaceState(null, '', `${location.pathname}${queryString}`);
    }

    // Funktion zum Anwenden der Filter
    function applyFilters() {
        const filters = $('#filter-options input[type="checkbox"]:checked').map(function() {
            return $(this).data('filter_id');
        }).get();

        // Reset visibility of all elements before applying filters
        $('.badgegroup span').hide();
        $('.accordion-content .dods ul').hide();
        $('.accordion-content .dods ul li').hide();
        $('.ws10-card').hide();

        if (filters.length > 0) {
            filters.forEach(filter => {
                $(`.badgegroup .${filter}_filter`).addClass("filteractive").show();
                $(`.accordion-content .dods ul[class*="${filter}tasks"]`).each(function() {
                    $(this).show().find('li').show();
                });
            });

            $('.ws10-card').each(function() {
                const card = $(this);
                let showCard = false;

                filters.forEach(filter => {
                    if (card.find(`.badgegroup .${filter}_filter`).length > 0 || card.find(`.dods ul[class*="${filter}tasks"]`).length > 0) {
                        showCard = true;
                    }
                });

                if (showCard) {
                    card.show();
                }
            });
        } else {
            $('.badgegroup span').removeClass("filteractive").show();
            $('.accordion-content .dods ul').show().find('li').show();
            $('.ws10-card').show();
        }

        adjustAccordionHeights(); // Adjust heights after filters are applied
    }

    // Funktion zum Setzen der Filter basierend auf dem Query-String
    function setFiltersFromQueryString() {
        const params = new URLSearchParams(window.location.search);
        const filters = params.get('filters');

        if (filters) {
            const filterArray = filters.split('%2C');
            filterArray.forEach(filterId => {
                $(`#filter-options input[data-filter_id="${filterId}"]`).prop('checked', true);
            });
            applyFilters(); // Anwenden der Filter nach dem Setzen
        }
    }

    // Setzen der Filter basierend auf dem Query-String beim Seitenaufruf
    setFiltersFromQueryString();

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
                <div class="progress">
                    <div class="progress-bar pass" style="width: ${passPercentage}%;">${passPercentage}%</div>
                    <div class="progress-bar fail" style="width: ${failPercentage}%;">${failPercentage}%</div>
                </div>
                <p>Pass: ${passCount}</p>
                <p>Fail: ${failCount}</p>
            `);
        }

        // Filter HTML erstellen und anhängen
        const filterHtml = `
            <div class="filter">
                <h3>Filter:</h3>
                <ul id="filter-options">
                    <li><div class="cat action" tabindex="0">
                        <label><input type="checkbox" value="filter_cm" data-filter_id="cm"><span class="ws10-text">Channel Management</span></label>
                    </div></li>
                    <li><div class="cat action" tabindex="0">
                        <label><input type="checkbox" value="filter_ux" data-filter_id="ux"><span class="ws10-text">User Experience</span></label>
                    </div></li>
                    <li><div class="cat action" tabindex="0">
                        <label><input type="checkbox" value="filter_dev" data-filter_id="dev"><span class="ws10-text">Frontend Development</span></label>
                    </div></li>
                    <li><div class="cat action" tabindex="0">
                        <label><input type="checkbox" value="filter_edt" data-filter_id="edt"><span class="ws10-text">Editorial</span></label>
                    </div></li>
                    <li><div class="cat action" tabindex="0">
                        <label><input type="checkbox" value="filter_testing" data-filter_id="testing"><span class="ws10-text">Testing</span></label>
                    </div></li>
                </ul>
                <div style="clear:both"></div>
            </div>`;
        $('#content-wrapper').prepend(filterHtml);

        // Function to adjust the max-height of open accordions
        function adjustAccordionHeights() {
            $('.accordion-content.open').each(function() {
                $(this).css('max-height', this.scrollHeight + 'px');
            });
        }

        // Filter-Logik hinzufügen
        $('#filter-options input[type="checkbox"]').change(function() {
            applyFilters();
            updateQueryString(); // Update the query string whenever a filter is changed
        });

        // Für jede Kategorie HTML erstellen und anhängen
        Object.keys(groupedByCategory).forEach(category => {
            const container = $('<div>').addClass('ws10-card');

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

                // Extrahieren der Rollen aus dem "dods"-Objekt
                const badgeGroup = $('<div>').addClass('badgegroup');
                if (item.dods) {
                    const dodsKeys = Object.keys(item.dods);
                    const uniqueRoles = new Set(dodsKeys.map(key => key.replace('tasks', '')));
                    uniqueRoles.forEach(role => {
                        badgeGroup.append(`<span class="${role}_filter">${role}</span>`);
                    });
                }
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
                            const passRadio = $('<input>').attr({ type: 'radio', name: 'status_' + task.taskid, id: 'pass_' + task.taskid, value: 'pass' });
                            const passLabel = $('<label>').attr('for', 'pass_' + task.taskid).text('pass');
                            const failRadio = $('<input>').attr({ type: 'radio', name: 'status_' + task.taskid, id: 'fail_' + task.taskid, value: 'fail' });
                            const failLabel = $('<label>').attr('for', 'fail_' + task.taskid).text('fail');

                            // Event-Handler für die Radio Buttons
                            passRadio.on('change', function () {
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

                            failRadio.on('change', function () {
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
                            resetButton.on('click', function () {
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

                            const applicableCheckbox = $('<input>').attr({ type: 'checkbox', id: 'applicable_' + task.taskid, name: 'applicable_' + task.taskid, checked: true });
                            const applicableLabel = $('<label>').attr('for', 'applicable_' + task.taskid).text('applicable');

                            // Checkbox in Switch verwandeln
                            const switchWrapper = $('<div>').addClass('switch');
                            const slider = $('<span>').addClass('slider');
                            switchWrapper.append(applicableCheckbox, slider);
                            li.append(switchWrapper, applicableLabel);

                            // Eventlistener für applicable Checkbox
                            applicableCheckbox.on('change', function () {
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
                            switchWrapper.on('click', function () {
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

            $('#content-wrapper').append(container);
        });

        // Separates div für Zähler hinzufügen
        $('#content-wrapper').append($('<div>').attr('id', 'counter'));
        updateCounter();

        // Apply filters based on URL query string after setting the filters
        setFiltersFromQueryString();
        applyFilters(); // Filter direkt nach dem Setzen der Filter anwenden
    });
});
