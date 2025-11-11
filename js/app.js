$(document).ready(function() {
    

    let fieldsetCount = 0;
    let selectedRadioCount = 0;
    let passCount = 0;
    let failCount = 0;


        function updateQueryString() {
        const selectedFilters = $('#filter-options input[type="checkbox"]:checked').map(function() {
            return $(this).data('filter_id');
        }).get();
        console.log('Selected Filters:', selectedFilters); // Debug-Ausgabe
    
        const selectedTaskFilters = $('#taskcat-dropdown input[type="checkbox"]:checked').map(function() {
            return $(this).data('filter_id');
        }).get();
        console.log('Selected Task Filters:', selectedTaskFilters); // Debug-Ausgabe
    
        let queryString = '';
    
        if (selectedFilters.length > 0) {
            queryString += `?role=${selectedFilters.join(',')}`;
        }
    
        if (selectedTaskFilters.length > 0) {
            if (queryString) {
                queryString += '&';
            } else {
                queryString += '?';
            }
            queryString += `tag=${selectedTaskFilters.join(',')}`;
        }
    
        console.log('Query String:', queryString); // Debug-Ausgabe
    
        history.replaceState(null, '', `${location.pathname}${queryString}`);
    }
    
    function setFiltersFromQueryString() {
        const params = new URLSearchParams(window.location.search);
        const filters = params.get('role');
        const taskfilters = params.get('tag');
        if (filters) {
            const filterArray = filters.split(',');
            filterArray.forEach(filterId => {
                $(`#filter-options input[data-filter_id="${filterId}"]`).prop('checked', true);
            });
        }
        if (taskfilters) {
            const taskfilterArray = taskfilters.split(',');
            taskfilterArray.forEach(taskfilterId => {
                $(`#taskcat-dropdown input[data-filter_id="${taskfilterId}"]`).prop('checked', true);
            });
        }
    }
    
    

    function saveState() {
        const state = {
            selectedRadios: {},
            applicableCheckboxes: {},
            comments: {},
            images: [], // Ensure this line is properly separated by a comma
            commentType: $('#comment-type').val() // Save the selected comment type
        };
    
        $('input[type="radio"]:checked').each(function() {
            state.selectedRadios[this.id] = this.checked;
        });
    
        $('input[type="checkbox"][id^="applicable_"]').each(function() {
            state.applicableCheckboxes[this.id] = this.checked;
        });
    
        $('li.taskContainer').each(function() {
            const taskId = $(this).attr('id');
            const comments = $(this).find('.comment-item').map(function() {
                return {
                    title: $(this).find('.comment-title').text().trim(),
                    text: $(this).data('comment-text'),
                    type: $(this).data('comment-type'),
                    images: $(this).data('images') || []
                };
            }).get();
            if (comments.length > 0) {
                state.comments[taskId] = comments;
            }
        });
    
        // Add this block to save images
        $('.uploaded-image-thumbnail').each(function() {
            const src = $(this).attr('src');
            if (src) {
                state.images.push(src);
            }
        });

       
        localStorage.setItem('filterState', JSON.stringify(state));

    }
    
    function loadState() {
        const state = JSON.parse(localStorage.getItem('filterState'));
    
        if (state) {
            for (const [key, value] of Object.entries(state.selectedRadios)) {
                $(`#${key}`).prop('checked', value);
            }
    
            for (const [key, value] of Object.entries(state.applicableCheckboxes)) {
                $(`#${key}`).prop('checked', value).trigger('change');
            }
    
            for (const [taskId, comments] of Object.entries(state.comments)) {
                const container = $(`li.taskContainer#${taskId}`);
                const commentsContainer = container.find('.comments');
                comments.forEach(comment => {
                    const commentItem = $(`
                        <div class="comment-item" data-comment-text="${comment.text}" data-comment-type="${comment.type}" data-images='${JSON.stringify(comment.images)}'>
                            <div class="comment-title">${comment.title}</div>
                            <span class="comment-type-display ${comment.type}">${comment.type}</span>
                            <div class="comment-controls">
                            <button class="edit-comment-button overlayKeyOff commentFunctionsButtons">
                                <svg class="icon24" id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                                    <polyline class="st0" points="147.38 70.11 121.57 44.02 36.49 129.1 27.77 164 62.67 155.27 147.38 70.11" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                    <path class="st0" d="M121.57,44l12.79-12.79a11,11,0,0,1,15.63,0l18,18.22L147.38,70.11" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"/>
                                    <line class="st0" x1="39.55" y1="126.1" x2="65.73" y2="152.28" fill="none" stroke-miterlimit="10" stroke-width="8"/>
                                </svg>
                            </button>
                            <button class="delete-comment-button overlayKeyOff commentFunctionsButtons">
                                <svg id="icon" class="icon24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                                    <line class="st0" x1="112.01" y1="144" x2="112.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                    <line class="st0" x1="80.01" y1="144" x2="80.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                    <line class="st0" x1="36" y1="44" x2="156" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                    <path class="st0" d="M120,44V36a16,16,0,0,0-16-16H88A16,16,0,0,0,72,36v8" fill="none" stroke-linejoin="round" stroke-width="8"/>
                                    <path class="st0" d="M148,44V156a16,16,0,0,1-16,16H60a16,16,0,0,1-16-16V44" fill="none" stroke-linejoin="round" stroke-width="8"/>
                                </svg>
                            </button>
                            </div>
                        </div>
                    `);
                    if (comment.images.length > 0) {
                        const imageThumbnailsContainer = $('<div class="comment-images-container"></div>');
                        comment.images.forEach(src => {
                            imageThumbnailsContainer.append(createImageThumbnail(src, true));
                        });
                        commentItem.append(imageThumbnailsContainer);
                    }
                    commentsContainer.append(commentItem);
                });
    
                if (comments.length > 0) {
                    commentsContainer.show();
                } else {
                    commentsContainer.hide();
                }
            }
    
            // Restore the saved comment type
            if (state.commentType) {
                $('#comment-type').val(state.commentType);
            }
        }
    

    }
    
          
    

    function clearState() {
        if (confirm('All checked elements will be reset. This can not be undone. Are you sure you want to proceed?')) {
            localStorage.removeItem('auditInfo');
            localStorage.removeItem('filterState');
            location.reload();
        }
    }

   // Anpassung für Dropdown-Menü in der Toolbar
  
    const dropdownButton = document.getElementById('toolBarDropdownButton');
    const dropdownMenu = document.getElementById('toolBarDropdownMenu');

    dropdownButton.addEventListener('click', () => {
        const isExpanded = dropdownButton.getAttribute('aria-expanded') === 'true';
        dropdownButton.setAttribute('aria-expanded', !isExpanded);
        dropdownMenu.style.display = isExpanded ? 'none' : 'block';
        dropdownMenu.setAttribute('aria-hidden', isExpanded);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDropdown();
        }
    });

    document.addEventListener('click', (event) => {
        if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            closeDropdown();
        }
    });

    function closeDropdown() {
        dropdownButton.setAttribute('aria-expanded', 'false');
        dropdownMenu.style.display = 'none';
        dropdownMenu.setAttribute('aria-hidden', 'true');
    }

    // Keyboard accessibility for dropdown items
    const menuItems = dropdownMenu.querySelectorAll('button');
    let currentIndex = -1;

    dropdownButton.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            currentIndex = (currentIndex + 1) % menuItems.length;
            menuItems[currentIndex].focus();
        }
    });

    menuItems.forEach((item, index) => {
        item.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                currentIndex = (index + 1) % menuItems.length;
                menuItems[currentIndex].focus();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                currentIndex = (index - 1 + menuItems.length) % menuItems.length;
                menuItems[currentIndex].focus();
            }
        });
    });

    

    function createImageThumbnail(src, forComment = false) {
        if (forComment) {
            return `<div class="imageThumbnail"><img src="${src}" class="uploadedImageThumbnail" tabindex="0" aria-label="View image in lightbox"></div>`;
        } else {
            return `
                <div class="image-thumbnail-container">
                    <img src="${src}" class="uploaded-image-thumbnail" tabindex="0" aria-label="View image in lightbox">
                    <button aria-label="Delete image" class="delete-image-button">
                        <svg id="icon" class="reset-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                            <line class="st0" x1="112.01" y1="144" x2="112.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                            <line class="st0" x1="80.01" y1="144" x2="80.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                            <line class="st0" x1="36" y1="44" x2="156" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                            <path class="st0" d="M120,44V36a16,16,0,0,0-16-16H88A16,16,0,0,0,72,36v8" fill="none" stroke-linejoin="round" stroke-width="8"/>
                            <path class="st0" d="M148,44V156a16,16,0,0,1-16,16H60a16,16,0,0,1-16-16V44" fill="none" stroke-linejoin="round" stroke-width="8"/>
                        </svg>
                    </button>
                </div>
            `;
        }
    }
    





    function adjustAccordionHeight(element) {
        const accordionContent = element.closest('.accordion-content');
        if (accordionContent.hasClass('open')) {
            accordionContent.css('max-height', accordionContent[0].scrollHeight + 'px');
        }
    }



    function updateCounter() {
        const totalSelected = passCount + failCount;
        const passPercentage = totalSelected > 0 ? (passCount / totalSelected * 100).toFixed(2) : 0;
        const failPercentage = totalSelected > 0 ? (failCount / totalSelected * 100).toFixed(2) : 0;
        const counterContent = `
            <p>${selectedRadioCount} tasks done | ${Math.max(fieldsetCount, 0)} tasks left</p>
           
            <div class="progress">
                <div class="progress-bar pass" style="width: ${passPercentage}%;">${passPercentage}%</div>
                <div class="progress-bar fail" style="width: ${failPercentage}%;">${failPercentage}%</div>
            </div>
            <p>Pass checked: ${passCount} | Fail checked: ${failCount}</p>
        `;
    
        $('#counter').html(counterContent);
       // Klone den Inhalt von #counter und füge ihn in #summaryOverlay-content ein
    const clonedContent = $('#counter').clone();
    $('#summaryOverlay-content').html(clonedContent.html());
    }
    

    function updateFieldsetCountAfterFiltering() {
        const visibleFieldsets = $('.accordion-content .dods ul li:visible');
        const newFieldsetCount = visibleFieldsets.length;
        fieldsetCount = newFieldsetCount;
        updateCounter();
    }



    function applyFilters() {
        const filters = $('#filter-options input[type="checkbox"]:checked').map(function() {
            return $(this).data('filter_id');
        }).get();
    
        const taskCatFilters = $('#taskcat-dropdown input[type="checkbox"]:checked').map(function() {
            return $(this).val();
        }).get();
    
        const bothFiltersSelected = filters.length > 0 && taskCatFilters.length > 0;
    
        $('.badgegroup span').removeClass("filteractive").show();
        $('.taglistitems').removeClass("categoryfilteractive").show();
        $('.accordion-content .dods ul').hide();
        $('.accordion-content .dods ul li').hide();
        $('.ws10-card').hide();
        $('div.roletitle').hide();
        $('div.roletitle + ul').hide();
        $('.bitvcontainer').hide();

        $('.status-options input[type="checkbox"]').each(function() {

            $(this).prop('checked', true);
          
        });
        
    
        if (filters.length > 0 || taskCatFilters.length > 0) {
            filters.forEach(filter => {
                $(`.badgegroup .${filter}_filter`).addClass("filteractive").show();
                $(`.accordion-content .dods ul[class*="${filter}tasks"]`).each(function() {
                    $(this).show().find('li').show();
                });
    
                $(`.accordion-content:has(.dods ul[class*="${filter}tasks"])`).each(function() {
                    const accordionContent = $(this);
                    const accordionHeader = accordionContent.prev('.accordion-header');
                    const accordionToggle = accordionContent.prev('.ws10-card__header');

                    accordionContent.addClass('open').css('max-height', accordionContent[0].scrollHeight + 'px');
                    accordionToggle.find('.ws10-accordion-item__chevron').addClass('rotate');
                });
    
                $(`div.roletitle + ul[class*="${filter}tasks"]`).each(function() {
                    $(this).show();
                    $(this).prev('div.roletitle').show();
                });
            });
    
            $('.ws10-card').each(function() {
                const card = $(this);
                let showCard = true;
    
                if (filters.length > 0) {
                    let hasFilter = false;
                    filters.forEach(filter => {
                        if (card.find(`.badgegroup .${filter}_filter`).length > 0 || card.find(`.dods ul[class*="${filter}tasks"]`).length > 0) {
                            hasFilter = true;
                        }
                    });
                    showCard = hasFilter;
                }
    
                if (taskCatFilters.length > 0) {
                    let hasTaskCatFilter = false;
                    taskCatFilters.forEach(taskCat => {
                        const containsExactText = card.find(`.taglistitems`).filter(function() {
                            return $(this).text().trim() === taskCat;
                        }).each(function() {
                            $(this).addClass("categoryfilteractive");
                        }).length > 0;
                        if (containsExactText) {
                            hasTaskCatFilter = true;
                        }
                    });
                    if (bothFiltersSelected) {
                        showCard = showCard && hasTaskCatFilter;
                    } else {
                        showCard = hasTaskCatFilter;
                    }
                }
    
                if (showCard) {
                    card.show();
                } else {
                    card.find('input[type="checkbox"]').each(function() {
                        $(this).prop('checked', false);
                    });
                }
            });
    
            $('li.taskContainer').each(function() {
                const li = $(this);
                let showLi = true;
    
                if (filters.length > 0) {
                    let hasFilter = false;
                    filters.forEach(filter => {
                        if (li.closest(`ul[class*="${filter}tasks"]`).length > 0) {
                            hasFilter = true;
                        }
                    });
                    showLi = hasFilter;
                }
    
                if (taskCatFilters.length > 0) {
                    let hasTaskCatFilter = false;
                    taskCatFilters.forEach(taskCat => {
                        const containsExactText = li.find(`.taglistitems`).filter(function() {
                            return $(this).text().trim() === taskCat;
                        }).length > 0;
                        if (containsExactText) {
                            hasTaskCatFilter = true;
                        }
                    });
                    if (bothFiltersSelected) {
                        showLi = showLi && hasTaskCatFilter;
                    } else {
                        showLi = hasTaskCatFilter;
                    }
                }
    
                if (showLi) {
                    li.show();
                    li.closest('ul').show();
                    li.closest('.dods').show();
                    li.closest('.ws10-card').show();
                    li.closest('ul').prev('div.roletitle').show();
                    li.closest('.bitvcontainer').show();
                    li.find('input[type="checkbox"]').each(function() {
                        const originalCheckedState = $(this).data('original-checked-state');
                        if (originalCheckedState !== undefined) {
                            $(this).prop('checked', true);
                        }
                    });
                } else {
                    li.hide();
                    li.find('input[type="checkbox"]').each(function() {
                        $(this).prop('checked', false);
                    });
                }
            });
    
            $('.bitvcontainer').each(function() {
                const container = $(this);
                let showContainer = false;
    
                container.find('li.taskContainer').each(function() {
                    const li = $(this);
                    let showLi = true;
    
                    if (filters.length > 0) {
                        let hasFilter = false;
                        filters.forEach(filter => {
                            if (li.closest(`ul[class*="${filter}tasks"]`).length > 0) {
                                hasFilter = true;
                            }
                        });
                        showLi = hasFilter;
                    }
    
                    if (taskCatFilters.length > 0) {
                        let hasTaskCatFilter = false;
                        taskCatFilters.forEach(taskCat => {
                            const containsExactText = li.find(`.taglistitems`).filter(function() {
                                return $(this).text().trim() === taskCat;
                            }).length > 0;
                            if (containsExactText) {
                                hasTaskCatFilter = true;
                            }
                        });
                        if (bothFiltersSelected) {
                            showLi = showLi && hasTaskCatFilter;
                        } else {
                            showLi = hasTaskCatFilter;
                        }
                    }
    
                    if (showLi) {
                        showContainer = true;
                    }
                });
    
                if (showContainer) {
                    container.show();
                    container.find('input[type="checkbox"]').each(function() {
                        const originalCheckedState = $(this).data('original-checked-state');
                        if (originalCheckedState !== undefined) {
                            $(this).prop('checked', true);
                        }
                    });
                } else {
                    container.hide();
                    container.find('input[type="checkbox"]').each(function() {
                        const originalCheckedState = $(this).data('original-checked-state');
                        if (originalCheckedState !== undefined) {
                            $(this).prop('checked', false);
                        }
                    });
                }
            });
    
        } else {
            // Rücksetzung der Ansicht
            $('.badgegroup span').removeClass("filteractive").show();
            $('.accordion-content .dods ul').show().find('li').show();
            $('.ws10-card').show();
            $('div.roletitle').show();
            $('div.roletitle + ul').show();
            $('.accordion-content').removeClass('open').css('max-height', '0');
            $('.accordion-toggle .ws10-accordion-item__chevron').removeClass('rotate');
            $('.bitvcontainer').show();
    
            // Rücksetzung der Checkboxen
            $('input[type="checkbox"]').each(function() {
                const originalCheckedState = $(this).data('original-checked-state');
                if (originalCheckedState !== undefined) {
                    $(this).prop('checked', true);
                }
            });
        }
    
        updateFilterNumberBadge();
        updateFilterNumberBadgeRoles();
        adjustAccordionHeights();
        updateQueryString();
        updateFieldsetCountAfterFiltering();
        saveState();
        updateDisplayedFilters();
        console.log("applyFilters executed");
    }
    

    
    
    
    /**Ende Filterlogik */
    
    function updateFilterNumberBadge() {
        $('.dropdown').each(function() {
            const dropdown = $(this);
            const checkedCount = dropdown.find('.dropdown-content input[type="checkbox"]:checked').length;
            let badge = dropdown.find('.filter-number-badge');
    
            if (checkedCount > 0) {
                if (badge.length === 0) {
                    badge = $('<div class="filter-number-badge" aria-label="amount of active tag-filter: ' + checkedCount + '" aria-live="polite"></div>');
                    dropdown.append(badge);
                }
                badge.text(checkedCount).show();
            } else {
                badge.hide();
            }
        });
    }

    function updateFilterNumberBadgeRoles() {
        $('.dropdown').each(function() {
            const dropdown = $(this);
            const checkedCount = dropdown.find('.dropdown-content-roles input[type="checkbox"]:checked').length;
            let badge = dropdown.find('.filter-number-badge-roles');
    
            if (checkedCount > 0) {
                if (badge.length === 0) {
                    badge = $('<div class="filter-number-badge-roles" aria-label="amount of active tag-filter: ' + checkedCount + '" aria-live="polite"></div>');
                    dropdown.append(badge);
                }
                badge.text(checkedCount).show();
            } else {
                badge.hide();
            }
        });
    }

    function updateDisplayedFilters() {
        const filterDiv = $('.filter');
        const selectedFilters = $('#filter-options input[type="checkbox"]:checked').map(function() {
            return { id: $(this).data('filter_id'), label: $(this).next('span').text() };
        }).get();
        const taskCatFilters = $('#taskcat-dropdown input[type="checkbox"]:checked').map(function() {
            return { id: $(this).val(), label: $(this).next('span').text() };
        }).get();

        const allSelectedFilters = [...new Map(selectedFilters.concat(taskCatFilters).map(filter => [filter.id, filter])).values()];

        const filterButtonsHtml = allSelectedFilters.map(filter => `
            <button aria-label="delete filter ${filter.label}" class="filter-button" data-filter_id="${filter.id}" aria-live="polite">
            <span class="remove-filter"><svg aria-hidden="true" id="filter-del-icon" class="ws10-button-icon-only__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
            <line class="st0" x1="44" y1="148" x2="148" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8.67"></line>
            <line class="st0" x1="148" y1="148" x2="44" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8.67"></line></svg>
            </span>   ${filter.label} 
            </button>
        `).join('');

        $('#selected-filters').html(filterButtonsHtml);

        $('.filter-button').click(function() {
            const filterId = $(this).data('filter_id');
            $(`#filter-options input[data-filter_id="${filterId}"], #taskcat-dropdown input[value="${filterId}"]`).prop('checked', false);
            applyFilters();
        });
    }

    function adjustAccordionHeights() {
        $('.accordion-content.open').each(function() {
            $(this).css('max-height', this.scrollHeight + 'px');
        });
    }


    

    function resetFilters() {
        $('#filter-options input[type="checkbox"]').prop('checked', false);
        $('#taskcat-dropdown input[type="checkbox"]').prop('checked', false);
        applyFilters();
    }

    setFiltersFromQueryString();


        
       
    const overlay = $(`<div class="slide-in-overlay-container">
        
        <div id="slide-in-overlay" aria-modal="true" role="dialog" class="ws10-overlay ws10-fade ws10-overlay--slide ws10-overlay--spacing ws10-overlay--align-left" style="display: none;">
            <div class="ws10-overlay__container">
                <div class="ws10-overlay__close">
                <button id="close-overlay" aria-label="Close" class="tabenable overlayKeyOn ws10-button-icon-only ws10-button-icon-only--tertiary ws10-button-icon-only--floating ws10-button-icon-only--standard close">
                <svg id="close-icon" class="ws10-button-icon-only__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
            
                        <line class="st0" x1="44" y1="148" x2="148" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8.67"/>
                        <line class="st0" x1="148" y1="148" x2="44" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8.67"/>
                  </svg>
                  
            </button>
                </div>
                <div class="testingOverlay-content ws10-overlay__content"></div>
            </div>
        </div>
        <div class="ws10-overlay__backdropTest ws10-fade ws10-in" style="display: none;">
    </div>`);
    
    $('body').append(overlay);
    
    $('#content-wrapper').on('click', '#open-overlay', function() {
        const li = $(this).closest('li');
        const head5 = li.closest('.bitvcontainer').find('h5'); // li in der Nähe der .bitvcontainer suchen
        const taskDesc = li.find('.taskdesc').html();
        const itemTitle = head5.html(); // Den Inhalt des <h5> Elements holen
        const testTool = li.find('.testtool').html();
        const taskImg = li.find('.instrimg').html();
        const testMethod = li.find('.testmethod').html();
        const testToolLink = li.find('.testtoollink').html();
    
        const overlayContent = $('.testingOverlay-content');
    
        if (itemTitle) {
            overlayContent.html(`
                <div>
                    <h5>${itemTitle}</h5>
                    <p>${taskDesc}</p>
                    <p>Test Tool: ${testTool}</p>
                    <p>Test Method: ${testMethod}</p>
                    <p>${taskImg}</p>
                    <p>Test Tool Link: ${testToolLink}</p>
                </div>
            `);
            $('#slide-in-overlay').css('display', 'block').addClass('ws10-in'); /*.css('transform', 'translateX(0)')*/
            $('.ws10-overlay__backdropTest').css('display', 'block').addClass('ws10-in').css('transform', 'translateX(0)');
            $('body').attr('aria-hidden', 'true').attr("tabindex", -1).addClass('ws10-no-scroll');
            $('footer').css('display', 'none');
            $('#close-overlay').attr("tabindex", 1);
            $('.tabenable').attr("tabindex", 1);
            $('.toolBarItem').attr("tabindex", -1);
            $('.action').attr("tabindex", -1);
            $('.dropdown-button').attr("tabindex", -1);
            $('.reset-button').attr("tabindex", -1);
            $('.open-overlay').attr("tabindex", -1);
            $('#reset-filters').attr("tabindex", -1);
            $('a').attr("tabindex", -1);
            $('input').attr("tabindex", -1);
        } else {
            console.error('No content found for overlay.');
        }
    });
    
    

    $('.slide-in-overlay-container').on('click', '.ws10-overlay__backdropTest', function() {
        $('#slide-in-overlay').removeClass('ws10-in').css('display', 'none');
        $('.ws10-overlay__backdropTest').css('transform', 'translateX(100%)').removeClass('ws10-in').css('display', 'none');
        $('body').removeAttr('aria-hidden', 'true').removeAttr("tabindex", -1).removeClass('ws10-no-scroll');
        $('footer').css('display', 'flex');
        $('#close-overlay').removeAttr("tabindex", 1);
        $('.tabenable').removeAttr("tabindex", 1);
        $('.toolBarItem').removeAttr("tabindex", -1);
        $('.action').removeAttr("tabindex", -1);
        $('.dropdown-button').removeAttr("tabindex", -1);
        $('.reset-button').removeAttr("tabindex", -1);
        $('.open-overlay').removeAttr("tabindex", -1);
        $('#reset-filters').removeAttr("tabindex", -1);
        $('a').removeAttr("tabindex", -1);
        $('input').removeAttr("tabindex", -1);
    });
    
    $('#slide-in-overlay').on('click', '#close-overlay', function() {
        $('#slide-in-overlay').removeClass('ws10-in').css('display', 'none');
        $('.ws10-overlay__backdropTest').css('transform', 'translateX(100%)').removeClass('ws10-in').css('display', 'none');
        $('body').removeAttr('aria-hidden', 'true').removeAttr("tabindex", -1).removeClass('ws10-no-scroll');
        $('footer').css('display', 'flex');
        $('#close-overlay').removeAttr("tabindex", 1);
        $('.tabenable').removeAttr("tabindex", 1);
        $('.toolBarItem').removeAttr("tabindex", -1);
        $('.action').removeAttr("tabindex", -1);
        $('.dropdown-button').removeAttr("tabindex", -1);
        $('.reset-button').removeAttr("tabindex", -1);
        $('.open-overlay').removeAttr("tabindex", -1);
        $('#reset-filters').removeAttr("tabindex", -1);
        $('a').removeAttr("tabindex", -1);
        $('input').removeAttr("tabindex", -1);
    });
    
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('#slide-in-overlay').removeClass('ws10-in').css('display', 'none');
        $('.ws10-overlay__backdropTest').css('transform', 'translateX(100%)').removeClass('ws10-in').css('display', 'none');
        $('body').removeAttr('aria-hidden', 'true').removeAttr("tabindex", -1).removeClass('ws10-no-scroll');
        $('footer').css('display', 'flex');
        $('#close-overlay').removeAttr("tabindex", 1);
        $('.tabenable').removeAttr("tabindex", 1);
        $('.toolBarItem').removeAttr("tabindex", -1);
        $('.action').removeAttr("tabindex", -1);
        $('.dropdown-button').removeAttr("tabindex", -1);
        $('.reset-button').removeAttr("tabindex", -1);
        $('.open-overlay').removeAttr("tabindex", -1);
        $('#reset-filters').removeAttr("tabindex", -1);
        $('a').removeAttr("tabindex", -1);
        $('input').removeAttr("tabindex", -1);
        }
    });



/** Kommentar overlay */
class CommentOverlay {
    constructor() {
        this.initOverlay();
        this.bindEvents();
        this.loadState();
        this.initializeTextarea();
        this.initializeSelect();
    }

    initOverlay() {
        this.commentOverlay = $(this.getOverlayTemplate());
        $('body').append(this.commentOverlay);
    }

bindEvents() {
  const events = [
    { selector: '.add-comment-button', event: 'click', handler: this.showAddCommentOverlay },
    { selector: '.edit-comment-button', event: 'click', handler: this.showEditCommentOverlay },
    { selector: '#save-comment', event: 'click', handler: this.saveComment },
    { selector: '#cancel-comment', event: 'click', handler: this.hideOverlay },
    { selector: '.delete-comment-button', event: 'click', handler: this.deleteComment },
    { selector: document, event: 'keydown', handler: this.handleEscapeKey },
    { selector: '.uploadedImageThumbnail', event: 'click', handler: this.openLightbox },
    { selector: '.close-lightbox', event: 'click', handler: this.closeLightbox }
  ];

  events.forEach(({ selector, event, handler }) => {
    $(document).on(event, selector, (e) => handler.call(this, e));
  });
}


    getOverlayTemplate() {
        return `
            <div class="slide-in-overlay-container">
                <div id="comment-overlay" class="ws10-overlay ws10-fade ws10-overlay--slide ws10-overlay--spacing ws10-overlay--align-left ws10-in" style="display: none;">
                    <div class="ws10-overlay__container">
                        <div class="ws10-overlay__close">
                            <button id="cancel-comment" aria-label="Cancel comment" class="ws10-button-icon-only ws10-button-icon-only--tertiary ws10-button-icon-only--floating ws10-button-icon-only--standard close overlayKeyOn" tabindex="1">
                                <svg id="close-icon" class="ws10-button-icon-only__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                                    <line class="st0" x1="44" y1="148" x2="148" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8.67"></line>
                                    <line class="st0" x1="148" y1="148" x2="44" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8.67"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="comment-overlay-content ws10-overlay__content">
                            ${this.getCommentFormTemplate()}
                            ${this.getImageUploadTemplate()}
                        </div>
                        ${this.getButtonsTemplate()}
                    </div>
                </div>
                ${this.getBackdropTemplate()}
            </div>
            ${this.getLightboxTemplate()}
        `;
    }

    getCommentFormTemplate() {
        return `
            <h5>Add or edit issue</h5>
            <div class="ws10-form-element-block ws10-form-element-block--text-input">
                <div class="ws10-form-element-block__label-container">
                    <label for="comment-title" class="ws10-form-label">Issue</label>
                </div>
                <div class="ws10-form-element-block__input-container">
                    <div class="ws10-form-text-input">
                        <textarea id="comment-title" name="text"></textarea>
                        <span class="ws10-form-text-input__notification_icon-container" style="display:none;">
                            <svg class="ws10-notification-icon ws10-notification-icon-- "></svg>
                        </span>
                        <span class="ws10-form-text-input__system_icon-container" style="display:none;">
                            <svg class="ws10-system-icon ws10-system-icon--size-inherit ws10-system-icon--color-monochrome-600"></svg>
                        </span>
                    </div>
                </div>
                <span class="ws10-form-element-block__helper-text ws10-text-smaller" aria-label="Helper text">Required</span>
                <span class="ws10-form-element-block__error-message ws10-text-smaller"></span>
            </div>
            <div class="ws10-form-element-block ws10-form-element-block--select">
                <div class="ws10-form-element-block__label-container">
                    <label for="comment-type" class="ws10-form-label">Issue Type</label>
                </div>
                <div class="ws10-form-element-block__input-container">
                    <select id="comment-type" class="ws10-form-select ws10-form-select__select">
                        <option value="violation" data-icon="violation-icon">Violation</option>
                        <option value="recommendation" data-icon="recommendation-icon">Recommendation</option>
                        <option value="info" data-icon="info-icon">Info</option>
                    </select>
                    <span class="ws10-form-select__notification_icon-container"><svg aria-hidden="true" class="ws10-form-select__chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><polyline class="st0" points="164 62 96 130 28 62" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"></polyline></svg></span>
                    </div>
                <span class="ws10-form-element-block__helper-text ws10-text-smaller" aria-label="Helper text">Required</span>
                <span class="ws10-form-element-block__error-message ws10-text-smaller"></span>
            </div>
            <div class="ws10-form-element-block ws10-form-element-block--textarea">
                <div class="ws10-form-element-block__label-container">
                    <label for="textarea-1" class="ws10-form-label">Description:</label>
                </div>
                <div class="ws10-form-element-block__input-container">
                    <div class="ws10-form-textarea">
                        <textarea rows="5" id="comment-text" class="ws10-form-textarea__textarea" name=""></textarea>
                        <span class="ws10-form-textarea__notification_icon-container"><svg class="ws10-notification-icon ws10-notification-icon-- "></svg></span>
                    </div>
                </div>
                <span class="ws10-form-element-block__helper-text ws10-text-smaller" aria-label="Helper text">Required</span>
                <span class="ws10-form-element-block__error-message ws10-text-smaller"></span>
            </div>
        `;
    }

    getImageUploadTemplate(contextId = 'issue') {
  const id = (suffix) => `${contextId}-${suffix}`;
  return `
    <div class="ws10-form-element-block__label-container">
      <label class="ws10-form-label" for="${id('image-url-input')}">Add screenshots by URL (jpg/png)</label>
    </div>

    <div id="${id('image-url-container')}" class="image-url-container">
      <div class="image-url-input-row">
        <input
          id="${id('image-url-input')}"
          type="url"
          inputmode="url"
          placeholder="https://…/screenshot.jpg  (Enter zum Hinzufügen)"
          class="ws10-form-input"
          aria-describedby="${id('image-url-help')}"
        />
        <button id="${id('image-url-add-btn')}" type="button" class="ws10-button ws10-button--primary">
          Add
        </button>
      </div>
      <div id="${id('image-url-help')}" class="image-url-help">
        Tipp: Du kannst auch mehrere URLs auf einmal einfügen (durch Komma, Leerzeichen oder Zeilenumbruch getrennt).
      </div>

      <div class="image-url-bulk">
        <details>
          <summary>Mehrere URLs auf einmal einfügen</summary>
          <textarea id="${id('image-url-bulk-textarea')}" rows="4" placeholder="Eine oder mehrere Bild-URLs einfügen…"></textarea>
          <div class="bulk-actions">
            <button id="${id('image-url-bulk-add')}" type="button" class="ws10-button">Alle hinzufügen</button>
            <button id="${id('image-url-bulk-clear')}" type="button" class="ws10-button ws10-button--ghost">Feld leeren</button>
          </div>
        </details>
      </div>
    </div>

    <div id="${id('image-thumbnails')}" class="image-thumbnails" aria-live="polite"></div>
  `;
}



    getButtonsTemplate() {
        return `
            <div class="overlayButtonsContainer">
                <button id="save-comment" class="ws10-secondary-button element50percentwidth">Save & Close</button>
                <button id="cancel-comment" class="ws10-alt-button element50percentwidth">Cancel</button>
            </div>
        `;
    }

    getBackdropTemplate() {
        return `
            <div class="ws10-overlay__backdropComment ws10-fade ws10-in" style="display: none;"></div>
        `;
    }

    getLightboxTemplate() {
        return `
            <div id="lightbox" class="lightbox" style="display: none;">
                <div class="lightbox-content">
                    <span class="close-lightbox" aria-label="Close lightbox">&times;</span>
                    <img class="lightbox-image">
                </div>
            </div>
        `;
    }

    initializeTextarea() {
        const textarea = document.getElementById('comment-title');
        if (textarea) {
            const storedValue = localStorage.getItem('comment-title');
            textarea.value = storedValue || '';
            this.adjustTextareaHeight(textarea); // Adjust height after setting the value
            textarea.addEventListener('input', () => this.adjustTextareaHeight(textarea));
        }
    }

    initializeSelect() {
        const select = document.getElementById('comment-type');
        if (select) {
            const storedValue = localStorage.getItem('comment-type');
            select.value = storedValue || 'violation';
            select.addEventListener('change', () => {
                localStorage.setItem('comment-type', select.value);
            });
        }
    }

    adjustTextareaHeight(textarea) {
        console.log('Adjusting textarea height');
        const minHeight = 48;
        textarea.style.height = `${minHeight}px`;
        textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;
    }

   showAddCommentOverlay(e) {
  e.stopPropagation();
  this.currentTaskContainer = $(e.currentTarget).closest('li.taskContainer');
  this.currentCommentItem = null;

  $('#comment-title').val('');
  $('#comment-text').val('');
  $('#comment-type').val('violation');

  // ⚠️ Alte File-Upload-UI NICHT mehr anfassen/füllen
  // $('#image-upload-area')...  -> ENTFÄLLT
  // $('#image-thumbnails').empty(); -> ENTFÄLLT (neue IDs!)

  // Neue URL-UI initialisieren (Default contextId: 'issue')
  initImageUrlModule('issue', []); // leer starten

  $('#comment-overlay').show();
  this.toggleBackdrop(true);
}


    showEditCommentOverlay(e) {
  e.stopPropagation();
  this.currentTaskContainer = $(e.currentTarget).closest('li.taskContainer');
  this.currentCommentItem = $(e.currentTarget).closest('.comment-item');

  const title = this.currentCommentItem.find('.comment-title').text();
  const text  = this.currentCommentItem.data('comment-text');
  const type  = this.currentCommentItem.data('comment-type');

  $('#comment-title').val(title);
  $('#comment-text').val(text);
  $('#comment-type').val(type);

  // Bestehende Bild-URLs aus dem Comment holen
  const images = this.currentCommentItem.data('images') || [];

  // URL-UI initialisieren und mit vorhandenen URLs befüllen
  initImageUrlModule('issue', images);

  $('#comment-overlay').show();
  this.toggleBackdrop(true);
}


/*     saveComment(e) {
        e.stopPropagation();
        const title = $('#comment-title').val().trim();
        const text = $('#comment-text').val().trim();
        const type = $('#comment-type').val();
        const images = this.getUploadedImages();

        if (title && text) {
            localStorage.setItem('comment-title', title);
            localStorage.setItem('comment-type', type);
            if (this.currentCommentItem) {
                this.updateExistingComment(title, text, type, images);
            } else {
                this.addNewComment(title, text, type, images);
            }
            this.adjustAccordionHeight(this.currentTaskContainer);
            this.saveState();
            this.hideOverlay();
        } else {
            alert('Both title and comment text are required.');
        }
    } */

        saveComment(e) {
            e.stopPropagation();
            const title = $('#comment-title').val().trim();
            const text = $('#comment-text').val().trim();
            const type = $('#comment-type').val();
            const images = getImageUrls('issue');

        
            if (title && text) {
                localStorage.setItem('comment-title', title);
                localStorage.setItem('comment-type', type);
                if (this.currentCommentItem) {
                    this.updateExistingComment(title, text, type, images);
                } else {
                    this.addNewComment(title, text, type, images);
                }
                this.adjustAccordionHeight(this.currentTaskContainer);
                adjustAccordionHeights(); // Adjust heights after saving the comment
                this.saveState();
                this.hideOverlay();
            } else {
                alert('Both title and comment text are required.');
            }
        }
/* 
    updateExistingComment(title, text, type, images) {
        this.currentCommentItem.find('.comment-title').text(title);
        this.currentCommentItem.find('.comment-type-display').text(type).attr('class', `comment-type-display ${type}`);
        this.currentCommentItem.data('comment-text', text);
        this.currentCommentItem.data('comment-type', type);
        this.currentCommentItem.data('images', images);
        this.currentCommentItem.find('.comment-images-container').remove();
        if (images.length > 0) {
            const imageThumbnailsContainer = $('<div class="comment-images-container"></div>');
            images.forEach(src => {
                imageThumbnailsContainer.append(this.createImageThumbnail(src, true));
            });
            this.currentCommentItem.append(imageThumbnailsContainer);
        }
    } */

        updateExistingComment(title, text, type, images) {
            this.currentCommentItem.find('.comment-title').text(title);
            this.currentCommentItem.find('.comment-type-display').text(type).attr('class', `comment-type-display ${type}`);
            this.currentCommentItem.data('comment-text', text);
            this.currentCommentItem.data('comment-type', type);
            this.currentCommentItem.data('images', images);
            this.currentCommentItem.find('.comment-images-container').remove();
            if (images.length > 0) {
                const imageThumbnailsContainer = $('<div class="comment-images-container"></div>');
                images.forEach(src => {
                    imageThumbnailsContainer.append(this.createImageThumbnail(src, true));
                });
                this.currentCommentItem.append(imageThumbnailsContainer);
            }
            adjustAccordionHeights(); // Adjust heights after updating the comment
        }

    /* addNewComment(title, text, type, images) {
        const commentItem = $(`
            <div class="comment-item" data-comment-text="${text}" data-comment-type="${type}" data-images='${JSON.stringify(images)}'>
                <div class="comment-title">${title}</div>
                <span class="comment-type-display ${type}">${type}</span>
                ${this.getCommentButtonsTemplate()}
            </div>
        `);
        if (images.length > 0) {
            const imageThumbnailsContainer = $('<div class="comment-images-container"></div>');
            images.forEach(src => {
                imageThumbnailsContainer.append(this.createImageThumbnail(src, true));
            });
            commentItem.append(imageThumbnailsContainer);
        }
        this.currentTaskContainer.find('.comments').append(commentItem);
    } */

        addNewComment(title, text, type, images) {
            const commentItem = $(`
                <div class="comment-item" data-comment-text="${text}" data-comment-type="${type}" data-images='${JSON.stringify(images)}'>
                    <div class="comment-title">${title}</div>
                    <span class="comment-type-display ${type}">${type}</span>
                    ${this.getCommentButtonsTemplate()}
                </div>
            `);
            if (images.length > 0) {
                const imageThumbnailsContainer = $('<div class="comment-images-container"></div>');
                images.forEach(src => {
                    imageThumbnailsContainer.append(this.createImageThumbnail(src, true));
                });
                commentItem.append(imageThumbnailsContainer);
            }
            this.currentTaskContainer.find('.comments').append(commentItem);
            adjustAccordionHeights(); // Adjust heights after adding the comment
        }

    getUploadedImages() {
        const images = [];
        $('#image-thumbnails img').each(function () {
            images.push($(this).attr('src'));
        });
        return images;
    }

    hideOverlay() {
        $('#comment-overlay').hide();
        this.toggleBackdrop(false);
    }

    deleteComment(e) {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this comment?')) {
            const commentItem = $(e.currentTarget).closest('.comment-item');
            const taskContainer = commentItem.closest('li.taskContainer');
            commentItem.remove();
            this.adjustAccordionHeight(taskContainer);
            this.saveState();
        }
    }

    handleEscapeKey(e) {
        if (e.key === 'Escape' && $('#comment-overlay').is(':visible')) {
            this.hideOverlay();
        }
    }

    handleImageUpload(e) {
        const files = e.target.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                $('#image-thumbnails').append(this.createImageThumbnail(event.target.result));
            };
            reader.readAsDataURL(file);
        }
    }

    createImageThumbnail(src, forComment = false) {
        if (forComment) {
            return `<div class="imageThumbnail"><img src="${src}" class="uploadedImageThumbnail" tabindex="0" aria-label="View image in lightbox"></div>`;
        } else {
            return `
                <div class="image-thumbnail-container">
                    <img src="${src}" class="uploaded-image-thumbnail" tabindex="0" aria-label="View image in lightbox">
                    <button aria-label="Delete image" class="delete-image-button">
                        <svg id="icon" class="reset-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                            <line class="st0" x1="112.01" y1="144" x2="112.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                            <line class="st0" x1="80.01" y1="144" x2="80.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                            <line class="st0" x1="36" y1="44" x2="156" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                            <path class="st0" d="M120,44V36a16,16,0,0,0-16-16H88A16,16,0,0,0,72,36v8" fill="none" stroke-linejoin="round" stroke-width="8"/>
                            <path class="st0" d="M148,44V156a16,16,0,0,1-16,16H60a16,16,0,0,1-16-16V44" fill="none" stroke-linejoin="round" stroke-width="8"/>
                        </svg>
                    </button>
                </div>
            `;
        }
    }

    deleteImage(e) {
        e.stopPropagation();
        $(e.currentTarget).closest('.image-thumbnail-container').remove();
    }

    openLightbox(e) {
        const src = $(e.currentTarget).attr('src');
        $('.lightbox-image').attr('src', src);
        $('#lightbox').show();
    }

    closeLightbox() {
        $('#lightbox').hide();
    }

    adjustAccordionHeight(taskContainer) {
        const commentsContainer = taskContainer.find('.comments');
        const height = commentsContainer.prop('scrollHeight');
        commentsContainer.height(height);
    }

    saveState() {
        const state = {
            selectedRadios: {},
            applicableCheckboxes: {},
            comments: {}
        };

        $('input[type="radio"]:checked').each(function () {
            state.selectedRadios[this.id] = this.checked;
        });

        $('input[type="checkbox"][id^="applicable_"]').each(function () {
            state.applicableCheckboxes[this.id] = this.checked;
        });

        $('li.taskContainer').each(function () {
            const taskId = $(this).attr('id');
            const commentsContainer = $(this).find('.comments');
            const comments = $(this).find('.comment-item').map(function () {
                return {
                    title: $(this).find('.comment-title').text().trim(),
                    text: $(this).data('comment-text'),
                    type: $(this).data('comment-type'),
                    images: $(this).data('images') || []
                };
            }).get();
            if (comments.length > 0) {
                state.comments[taskId] = comments;
                commentsContainer.show();
            } else {
                commentsContainer.hide();
            }
            adjustAccordionHeight(commentsContainer);
        });

        localStorage.setItem('filterState', JSON.stringify(state));
    }

    loadState() {
        const state = JSON.parse(localStorage.getItem('filterState'));
        const savedText = localStorage.getItem('comment-title');

        if (state) {
            for (const [key, value] of Object.entries(state.selectedRadios)) {
                $(`#${key}`).prop('checked', value);
            }

            for (const [key, value] of Object.entries(state.applicableCheckboxes)) {
                $(`#${key}`).prop('checked', value).trigger('change');
            }

            for (const [taskId, comments] of Object.entries(state.comments)) {
                const container = $(`li.taskContainer#${taskId}`);
                const commentsContainer = container.find('.comments');
                comments.forEach(comment => {
                    const commentItem = $(`
                        <div class="comment-item" data-comment-text="${comment.text}" data-comment-type="${comment.type}" data-images='${JSON.stringify(comment.images)}'>
                            <div class="comment-title">${comment.title}</div>
                            <span class="comment-type-display ${comment.type}">${comment.type}</span>
                            <div class="comment-controls">
                            <button class="edit-comment-button overlayKeyOff commentFunctionsButtons" aria-label="edit comment">
                                <svg class="icon24" id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                                    <polyline class="st0" points="147.38 70.11 121.57 44.02 36.49 129.1 27.77 164 62.67 155.27 147.38 70.11" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                    <path class="st0" d="M121.57,44l12.79-12.79a11,11,0,0,1,15.63,0l18,18.22L147.38,70.11" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"/>
                                    <line class="st0" x1="39.55" y1="126.1" x2="65.73" y2="152.28" fill="none" stroke-miterlimit="10" stroke-width="8"/>
                                </svg>
                            </button>
                            <button class="delete-comment-button overlayKeyOff commentFunctionsButtons" aria-label="delete comment">
                                <svg id="icon" class="icon24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                                    <line class="st0" x1="112.01" y1="144" x2="112.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                    <line class="st0" x1="80.01" y1="144" x2="80.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                    <line class="st0" x1="36" y1="44" x2="156" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                    <path class="st0" d="M120,44V36a16,16,0,0,0-16-16H88A16,16,0,0,0,72,36v8" fill="none" stroke-linejoin="round" stroke-width="8"/>
                                    <path class="st0" d="M148,44V156a16,16,0,0,1-16,16H60a16,16,0,0,1-16-16V44" fill="none" stroke-linejoin="round" stroke-width="8"/>
                                </svg>
                            </button>
                            </div>
                        </div>
                    `);
                    if (comment.images.length > 0) {
                        const imageThumbnailsContainer = $('<div class="comment-images-container"></div>');
                        comment.images.forEach(src => {
                            imageThumbnailsContainer.append(createImageThumbnail(src, true));
                        });
                        commentItem.append(imageThumbnailsContainer);
                    }
                    commentsContainer.append(commentItem);
                });

                if (comments.length > 0) {
                    commentsContainer.show();
                } else {
                    commentsContainer.hide();
                }
            }

            if (state.images && state.images.length > 0) {
                state.images.forEach(src => {
                    $('#image-thumbnails').append(createImageThumbnail(src));
                });
            }

            // Restore the saved comment type
            if (state.commentType) {
                $('#comment-type').val(state.commentType);
            }
        }

        $('.accordion-function input[type="checkbox"]').each(function() {
            const allApplicableChecked = $(this).closest('.ws10-card').find('input[type="checkbox"][id^="applicable_"]').length === 
                                         $(this).closest('.ws10-card').find('input[type="checkbox"][id^="applicable_"]:checked').length;
            $(this).prop('checked', allApplicableChecked);
        });
    }

    getCommentButtonsTemplate() {
        return `
        <div class="comment-controls">
            <button class="edit-comment-button overlayKeyOff commentFunctionsButtons" aria-label="edit issue">
                <svg class="icon24" id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                    <polyline class="st0" points="147.38 70.11 121.57 44.02 36.49 129.1 27.77 164 62.67 155.27 147.38 70.11" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                    <path class="st0" d="M121.57,44l12.79-12.79a11,11,0,0,1,15.63,0l18,18.22L147.38,70.11" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"/>
                    <line class="st0" x1="39.55" y1="126.1" x2="65.73" y2="152.28" fill="none" stroke-miterlimit="10" stroke-width="8"/>
                </svg>
            </button>
            <button class="delete-comment-button overlayKeyOff commentFunctionsButtons" aria-label="delete issue">
                <svg id="icon" class="icon24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                    <line class="st0" x1="112.01" y1="144" x2="112.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                    <line class="st0" x1="80.01" y1="144" x2="80.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                    <line class="st0" x1="36" y1="44" x2="156" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                    <path class="st0" d="M120,44V36a16,16,0,0,0-16-16H88A16,16,0,0,0,72,36v8" fill="none" stroke-linejoin="round" stroke-width="8"/>
                    <path class="st0" d="M148,44V156a16,16,0,0,1-16,16H60a16,16,0,0,1-16-16V44" fill="none" stroke-linejoin="round" stroke-width="8"/>
                </svg>
            </button>
            </div>
        `;
    }

    toggleBackdrop(show) {
        const display = show ? 'block' : 'none';
        const transform = show ? 'translateX(0)' : 'translateX(100%)';
        const backdropClass = show ? 'addClass' : 'removeClass';
        $('.ws10-overlay__backdropComment').css('display', display).css('transform', transform)[backdropClass]('ws10-in');
        $('body').attr('aria-hidden', show).attr("tabindex", show ? -1 : null).toggleClass('ws10-no-scroll', show);
        $('footer').css('display', show ? 'none' : 'flex');
        $('.overlayKeyOn').attr("tabindex", show ? 1 : -1);
        $('.overlayKeyOff').attr("tabindex", show ? -1 : 1);
    }
}


/**
 * Initialisiert Events/Rendering für die Bild-URL-UI.
 * @param {string} contextId
 * @param {string[]} initialUrls
 */
function initImageUrlModule(contextId, initialUrls = []) {
  const q = (suffix) => document.getElementById(`${contextId}-${suffix}`);
  const els = {
    input: q('image-url-input'),
    addBtn: q('image-url-add-btn'),
    bulkTA: q('image-url-bulk-textarea'),
    bulkAdd: q('image-url-bulk-add'),
    bulkClear: q('image-url-bulk-clear'),
    thumbs: q('image-thumbnails'),
    container: q('image-url-container')
  };

  // interner Speicher auf dem Container (vermeidet LocalStorage)
  els.container._imageUrls = Array.isArray(initialUrls) ? [...initialUrls] : [];

  // Initial render
  renderImageThumbnails(contextId);

  // Einzel-Add: mit Button
  els.addBtn?.addEventListener('click', () => {
    const urls = parseUrlInput(els.input.value);
    addUrls(contextId, urls);
    els.input.value = '';
  });

  // Einzel-Add: mit Enter
  els.input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const urls = parseUrlInput(els.input.value);
      addUrls(contextId, urls);
      els.input.value = '';
    }
  });

  // Bulk-Add
  els.bulkAdd?.addEventListener('click', () => {
    const urls = parseUrlInput(els.bulkTA.value);
    addUrls(contextId, urls);
  });

  // Bulk-Clear
  els.bulkClear?.addEventListener('click', () => {
    els.bulkTA.value = '';
  });

  // Delegation: Entfernen einzelner Bilder
  els.thumbs?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="remove-image"]');
    if (!btn) return;
    const idx = Number(btn.getAttribute('data-index'));
    removeUrlAt(contextId, idx);
  });
}

/**
 * Gibt die aktuell gesetzten Bild-URLs zurück.
 * @param {string} contextId
 * @returns {string[]}
 */
function getImageUrls(contextId) {
  const container = document.getElementById(`${contextId}-image-url-container`);
  return container?._imageUrls ? [...container._imageUrls] : [];
}

/**
 * Überschreibt die Bild-URLs (z. B. beim Laden eines bestehenden Issues).
 * @param {string} contextId
 * @param {string[]} urls
 */
function setImageUrls(contextId, urls = []) {
  const container = document.getElementById(`${contextId}-image-url-container`);
  if (!container) return;
  container._imageUrls = Array.isArray(urls) ? [...urls] : [];
  renderImageThumbnails(contextId);
}

/* ------------------------ Hilfsfunktionen ------------------------ */

function parseUrlInput(raw) {
  if (!raw) return [];
  // Split an Komma, Leerzeichen, Zeilenumbrüchen
  const parts = raw
    .split(/[\s,]+/g)
    .map(s => s.trim())
    .filter(Boolean);

  // Grobe URL-Validierung: http(s) erforderlich
  const urls = [];
  for (const p of parts) {
    try {
      const u = new URL(p);
      if (u.protocol === 'http:' || u.protocol === 'https:') {
        urls.push(u.toString());
      }
    } catch {
      // ignorieren, wenn keine gültige URL
    }
  }
  return urls;
}

function addUrls(contextId, urls) {
  if (!urls || urls.length === 0) return;
  const container = document.getElementById(`${contextId}-image-url-container`);
  if (!container) return;

  const list = container._imageUrls || [];
  // Duplikate vermeiden
  const set = new Set(list);
  let added = 0;
  for (const u of urls) {
    if (!set.has(u)) {
      set.add(u);
      added++;
    }
  }
  container._imageUrls = Array.from(set);
  if (added > 0) renderImageThumbnails(contextId);
}

function removeUrlAt(contextId, index) {
  const container = document.getElementById(`${contextId}-image-url-container`);
  if (!container || !Array.isArray(container._imageUrls)) return;
  if (index < 0 || index >= container._imageUrls.length) return;
  container._imageUrls.splice(index, 1);
  renderImageThumbnails(contextId);
}

function renderImageThumbnails(contextId) {
  const thumbs = document.getElementById(`${contextId}-image-thumbnails`);
  const container = document.getElementById(`${contextId}-image-url-container`);
  if (!thumbs || !container) return;

  const urls = container._imageUrls || [];
  if (urls.length === 0) {
    thumbs.innerHTML = `<div class="image-thumbnails__empty">Keine Screenshots hinzugefügt.</div>`;
    return;
  }

  thumbs.innerHTML = urls.map((url, i) => {
    const safeUrlText = escapeHtml(url);
    return `
      <div class="image-thumb" data-index="${i}">
        <div class="image-thumb__media">
          <img src="${safeUrlText}" alt="Screenshot ${i + 1}" loading="lazy" onerror="this.closest('.image-thumb').classList.add('is-error');" />
        </div>
        <div class="image-thumb__meta">
          <a class="image-thumb__link" href="${safeUrlText}" target="_blank" rel="noopener noreferrer" title="${safeUrlText}">
            ${truncateMiddle(safeUrlText, 60)}
          </a>
          <button type="button" class="ws10-button ws10-button--ghost image-thumb__remove" data-action="remove-image" data-index="${i}">
            Remove
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]
  ));
}

function truncateMiddle(str, max = 60) {
  if (str.length <= max) return str;
  const half = Math.floor((max - 1) / 2);
  return `${str.slice(0, half)}…${str.slice(-half)}`;
}




function loadState() {
    const state = JSON.parse(localStorage.getItem('filterState'));
    const savedText = localStorage.getItem('comment-title');

    if (state) {
        for (const [key, value] of Object.entries(state.selectedRadios)) {
            $(`#${key}`).prop('checked', value);
        }

        for (const [key, value] of Object.entries(state.applicableCheckboxes)) {
            $(`#${key}`).prop('checked', value).trigger('change');
        }

        for (const [taskId, comments] of Object.entries(state.comments)) {
            const container = $(`li.taskContainer#${taskId}`);
            const commentsContainer = container.find('.comments');
            comments.forEach(comment => {
                const commentItem = $(`
                    <div class="comment-item" data-comment-text="${comment.text}" data-comment-type="${comment.type}" data-images='${JSON.stringify(comment.images)}'>
                        <div class="comment-title">${comment.title}</div>
                        <span class="comment-type-display ${comment.type}">${comment.type}</span>
                        <div class="comment-controls">
                        <button class="edit-comment-button overlayKeyOff commentFunctionsButtons" aria-label="edit issue">
                            <svg class="icon24" id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                                <polyline class="st0" points="147.38 70.11 121.57 44.02 36.49 129.1 27.77 164 62.67 155.27 147.38 70.11" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                <path class="st0" d="M121.57,44l12.79-12.79a11,11,0,0,1,15.63,0l18,18.22L147.38,70.11" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"/>
                                <line class="st0" x1="39.55" y1="126.1" x2="65.73" y2="152.28" fill="none" stroke-miterlimit="10" stroke-width="8"/>
                            </svg>
                        </button>
                        <button class="delete-comment-button overlayKeyOff commentFunctionsButtons">
                            <svg id="icon" class="icon24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" aria-label="delete issue">
                                <line class="st0" x1="112.01" y1="144" x2="112.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                <line class="st0" x1="80.01" y1="144" x2="80.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                <line class="st0" x1="36" y1="44" x2="156" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
                                <path class="st0" d="M120,44V36a16,16,0,0,0-16-16H88A16,16,0,0,0,72,36v8" fill="none" stroke-linejoin="round" stroke-width="8"/>
                                <path class="st0" d="M148,44V156a16,16,0,0,1-16,16H60a16,16,0,0,1-16-16V44" fill="none" stroke-linejoin="round" stroke-width="8"/>
                            </svg>
                        </button>
                        </div>
                    </div>
                `);
                if (comment.images.length > 0) {
                    const imageThumbnailsContainer = $('<div class="comment-images-container"></div>');
                    comment.images.forEach(src => {
                        imageThumbnailsContainer.append(createImageThumbnail(src, true));
                    });
                    commentItem.append(imageThumbnailsContainer);
                }
                commentsContainer.append(commentItem);
            });

            if (comments.length > 0) {
                commentsContainer.show();
            } else {
                commentsContainer.hide();
            }
        }

        if (state.images && state.images.length > 0) {
            state.images.forEach(src => {
                $('#image-thumbnails').append(createImageThumbnail(src));
            });
        }

        // Restore the saved comment type
        if (state.commentType) {
            $('#comment-type').val(state.commentType);
        }
    }
    $('.accordion-function input[type="checkbox"]').each(function() {
        const allApplicableChecked = $(this).closest('.ws10-card').find('input[type="checkbox"][id^="applicable_"]').length === 
                                     $(this).closest('.ws10-card').find('input[type="checkbox"][id^="applicable_"]:checked').length;
        $(this).prop('checked', allApplicableChecked);
    });

}




$(document).ready(() => {
    new CommentOverlay();
});




    $.getJSON('https://va11ydate.github.io/accessibility-checklist/data/data.json', function(jsonArray) {
        const groupedByCategory = {};
        const groupedByCategorySummary = {};
        const taskCategories = new Set();

        localStorage.setItem('jsonArray', JSON.stringify(jsonArray));

        jsonArray.forEach(item => {
            const category = item.category;
            if (!groupedByCategory[category]) {
                groupedByCategory[category] = [];
            }
            groupedByCategory[category].push(item);

            if (item.dods) {
                Object.values(item.dods).forEach(tasks => {
                    tasks.forEach(task => {
                        if (task.taskcat) {
                            task.taskcat.forEach(cat => taskCategories.add(cat));
                        }
                    });
                });
            }
        });

        // Konvertiere das Set in ein Array und sortiere es alphabetisch
        const sortedTaskCategories = [...taskCategories].sort((a, b) => {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        const filterHtml = `
        <div class="filter">
            <h4>Filter:</h4>
            <ul>
                <li>
                <div class="dropdown">
                <button class="dropdown-button-roles overlayKeyOff">Select Roles <svg aria-hidden="true" class="dropdown-item__chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><polyline class="st0" points="164 62 96 130 28 62" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"></polyline></svg></button>
                <div class="dropdown-content-roles">
                    <ul id="filter-options" class="dropdownContainer">
                        <li>
                            <label>
                            <input type="checkbox" value="filter_ux" data-filter_id="ux">
                            <span class="ws10-text">User Experience</span>
                            </label>
                        </li>
                    </ul>
                  <!--  <div class="scroll-arrow">↓</div> -->
                    </div>
                    
                </div>
                
                </li>
                
                <li>
                <div class="dropdown">
                    <button class="dropdown-button overlayKeyOff">Select Tags <svg aria-hidden="true" class="dropdown-item__chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><polyline class="st0" points="164 62 96 130 28 62" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"></polyline></svg></button>
                        <div class="dropdown-content">
                            <ul id="taskcat-dropdown" class="dropdownContainer">
                            ${[...sortedTaskCategories].map(cat => `
                                <li>
                                    <label>
                                    <input class="overlayKeyOff" type="checkbox" value="${cat}" data-filter_id="${cat}">
                                    <span class="ws10-text">${cat}</span>
                                    </label>
                                </li>`).join('')}
            </ul>
                        </div>
                </div>
            </li>
            <li><button class="ws10-secondary-button overlayKeyOff" id="reset-filters">Reset all filters</button></li>
            </ul>
            
            <div style="clear:both"></div>
        </div>
        <div id="selected-filters"></div>
        `;

        $('#content-wrapper').prepend(filterHtml);

        $('.dropdown-button').click(function() {
            $('.dropdown-content').toggle().toggleClass('open');
        });

        $('.dropdown-button-roles').click(function() {
            $('.dropdown-content-roles').toggle().toggleClass('open');
        });

        $(document).keydown(function(e) {
            if (e.key === "Escape" && $('.dropdown-content').hasClass('open')) {
                $('.dropdown-content').hide().removeClass('open');
                $('.dropdown-button').focus();
            }
        });

        $(document).keydown(function(e) {
            if (e.key === "Escape" && $('.dropdown-content-roles').hasClass('open')) {
                $('.dropdown-content-roles').hide().removeClass('open');
                $('.dropdown-button-roles').focus();
            }
        });

        $(document).click(function(e) {
            if (!$(e.target).closest('.dropdown-button, .dropdown-content').length) {
                $('.dropdown-content').hide().removeClass('open');
            }
        });

        $(document).click(function(e) {
            if (!$(e.target).closest('.dropdown-button-roles, .dropdown-content-roles').length) {
                $('.dropdown-content-roles').hide().removeClass('open');
            }
        });

        $('#filter-options input[type="checkbox"], #taskcat-dropdown input[type="checkbox"]').change(function() {
            applyFilters();
            updateFilterNumberBadge();
            updateFilterNumberBadgeRoles();
            adjustAccordionHeights();
        });

        $('#reset-filters').click(function() {
            resetFilters();
            adjustAccordionHeights();
        });

        $('#clear-state').click(function() {
            clearState();
            adjustAccordionHeights();
        }); 

        Object.keys(groupedByCategory).forEach(category => {
            const container = $('<div>').addClass('ws10-card');
            const header = $('<div>').addClass('ws10-card__header');

            const accordionHeader = $('<button>').addClass('accordion-header');
            const accordionToggle = $('<button>').addClass('accordion-toggle');
            const svg = $('<svg aria-hidden="true" class="ws10-accordion-item__chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><polyline class="st0" points="164 62 96 130 28 62" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"></polyline></svg>');
            accordionToggle.append(svg);

        
            const selectAllSwitchWrapper = $('<div>').addClass('selectAllSwitch');

            const selectAllCheckbox = $('<input>').attr({ type: 'checkbox', id: 'select_all_applicable_' + category }).addClass('overlayKeyOff selectAllSwitch');
            selectAllCheckbox.prop('checked', true); 

            const selectAllSlider = $('<span>').addClass('selectAllSlider');

            selectAllSwitchWrapper.append(selectAllCheckbox, selectAllSlider); // selectAllSwitchWrapper.append(selectAllCheckbox, selectAllSlider);


            selectAllSwitchWrapper.on('click', function() {
                selectAllCheckbox.prop('checked', !selectAllCheckbox.prop('checked')).trigger('change');
            });


            const accordionFunction = $('<div>').addClass('accordion-function');

            accordionFunction.append(selectAllSwitchWrapper);
            accordionHeader.append(accordionFunction);
            
            
          

           // accordionHeader.append(accordionToggle);  Moved the accordionToggle append after accordionFunction

           

            
            // Event-Handler für die Checkbox hinzufügen
            selectAllCheckbox.on('change', function() {
                const isChecked = $(this).is(':checked');
                $(this).closest('.ws10-card').find('input[type="checkbox"][id^="applicable_"]').prop('checked', isChecked).trigger('change');
            });


            const accordionTitle = $('<h4>').text(category).addClass('accordion-title');

          

            accordionHeader.append(accordionTitle);
            header.append(accordionHeader, accordionFunction, accordionToggle);

            
      /*       container.append(accordionHeader);
            container.append(accordionFunction); */
            container.append(header);

            

            const accordionContent = $('<div>').addClass('accordion-content').css('max-height', '0');
            groupedByCategory[category].forEach(item => {
                const innerDiv = $('<div>').attr('id', item.id).addClass('bitvcontainer');
                innerDiv.append(`<span class="bitvnr">${item.bitv}</span>`);
                innerDiv.append(`<h5>${item.title}</h5>`).addClass('itemtitle');

                const badgeGroup = $('<div>').addClass('badgegroup');
                if (item.dods) {
                    const dodsKeys = Object.keys(item.dods);
                    const uniqueRoles = new Set(dodsKeys.map(key => key.replace('tasks', '')));
                    badgeGroup.append(`<div class="roles">Roles:</div>`);
                    uniqueRoles.forEach(role => {
                        badgeGroup.append(`<span class="${role}_filter">${role}</span>`);
                    });
                }
                innerDiv.append(badgeGroup);

                if (item.dods) {
                    const dodsDiv = $('<div>').addClass('dods');
                    Object.keys(item.dods).forEach(taskType => {
                        const tasks = item.dods[taskType];

                        let roletitle = '';
                        if (tasks.length > 0 && tasks[0].roletitle) {
                            roletitle = tasks[0].roletitle;
                        }

                        if (roletitle) {
                            const roletitleDiv = $('<div>').addClass('roletitle').text(roletitle);
                            dodsDiv.append(roletitleDiv);
                        }
                        
                        const ul = $('<ul>').addClass(taskType + 'tasks');
                        tasks.forEach(task => {
                            if (task.taskid) {
                                const li = $('<li>').attr('id', task.taskid).addClass('taskContainer');

                                if (task.taskdesc) {
                                    li.append($('<div>').addClass('taskdesc').html(task.taskdesc));
                                }

                                if (task.taskdescimg) {
                                    li.append($('<div>').addClass('taskdescimg').html(task.taskdescimg));
                                }
                        
                                if (task.tasktype) {
    // Container erzeugen
    const tasktypeContainer = $('<div>').addClass('tasktype-container');

    // Inhalt hinzufügen
    tasktypeContainer.append($('<div><strong>Level:</strong></div>').addClass('tasktype-desc'));
    tasktypeContainer.append($('<div>').addClass('tasktype').text(task.tasktype));

    // Container ins li einfügen
    li.append(tasktypeContainer);
}



                               
                                const taskCatDiv = $('<div>').addClass('taskcat');
                                
                                if (task.taskcat && task.taskcat.length > 0) {
                                    const taskCatDiv = $('<div>').addClass('taskcat');
                                    taskCatDiv.append($('<div>').text('Tags:').addClass('filterTextCat'));
                        
                                    task.taskcat.forEach(cat => {
                                        taskCatDiv.append($('<div>').text(cat).addClass('taglistitems'));
                                    });
                        
                                    li.append(taskCatDiv);
                                }
                                
                                taskCatDiv.append($('<div style="clear:both"></div>'));
                                

                                
                                li.append($('<div>').addClass('testtool').html(task.testtool).hide());
                                li.append($('<div>').addClass('testmethod').html(task.testmethod).hide());
                                li.append($('<div>').addClass('testtoollink').html(task.testtoollink).hide());
                               
                                const fieldset = $('<fieldset>').addClass('status-options');
                                const radioLegend = $('<legend>').text('compliance').addClass('status-optionslegend');
                                const passRadio = $('<input>').attr({ type: 'radio', name: 'status_' + task.taskid, id: 'pass_' + task.taskid, value: 'pass' }).addClass('ws10-form-selection-control__input overlayKeyOff');
                                const passLabel = $('<label>').attr('for', 'pass_' + task.taskid).addClass('ws10-form-selection-control__label');
                                passLabel.append($('<span>').addClass('ws10-form-selection-control__text').html('<p>pass</p>'));
                                const failRadio = $('<input>').attr({ type: 'radio', name: 'status_' + task.taskid, id: 'fail_' + task.taskid, value: 'fail' }).addClass('ws10-form-selection-control__input overlayKeyOff');
                                const failLabel = $('<label>').attr('for', 'fail_' + task.taskid).addClass('ws10-form-selection-control__label');
                                failLabel.append($('<span>').addClass('ws10-form-selection-control__text').html('<p>fail</p>'));

                                passRadio.on('change', function() {
                                    const fieldset = $(this).closest('fieldset');
                                    const previousValue = fieldset.data('previousValue');
                                    if (!fieldset.data('isChecked')) {
                                        selectedRadioCount++;
                                        fieldsetCount = Math.max(fieldsetCount - 1, 0);
                                        fieldset.data('isChecked', true);
                                    }
                                    if (previousValue === 'fail') {
                                        failCount = failCount > 0 ? failCount - 1 : 0;
                                        passCount++;
                                    } else if (previousValue !== 'pass') {
                                        passCount++;
                                    }
                                    fieldset.data('previousValue', 'pass');
                                    updateCounter();
                                    saveState();
                                });
                                
                                failRadio.on('change', function() {
                                    const fieldset = $(this).closest('fieldset');
                                    const previousValue = fieldset.data('previousValue');
                                    if (!fieldset.data('isChecked')) {
                                        selectedRadioCount++;
                                        fieldsetCount = Math.max(fieldsetCount - 1, 0);
                                        fieldset.data('isChecked', true);
                                    }
                                    if (previousValue === 'pass') {
                                        passCount = passCount > 0 ? passCount - 1 : 0;
                                        failCount++;
                                    } else if (previousValue !== 'fail') {
                                        failCount++;
                                    }
                                    fieldset.data('previousValue', 'fail');
                                    updateCounter();
                                    saveState();
                                });
                                
                                const resetButton = $('<div class="reset-button-container"><button class="reset-button overlayKeyOff"><svg class="reset-button-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><path class="st0" d="M108.84,155.75a60,60,0,0,0,1.72-120l-1.88,0a60,60,0,0,0-59.92,60v27.36" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/><polyline class="st0" points="77.44 95.6 48.76 123.11 20.86 95.6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/></svg></button></div>');

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
                                        fieldset.data('isChecked', false);
                                        fieldset.data('previousValue', null);
                                        updateCounter();
                                        saveState();
                                    }
                                });

                                

                                const applicableCheckbox = $('<input>').attr({ type: 'checkbox', id: 'applicable_' + task.taskid, name: 'applicable_' + task.taskid, checked: true }).addClass("overlayKeyOff");
                                const applicableLabel = $('<label>').attr('for', 'applicable_' + task.taskid).text('applicable').addClass("applicableLabel");

                                const switchWrapper = $('<div>').addClass('switch');
                                const slider = $('<span>').addClass('slider');
                                switchWrapper.append(applicableCheckbox, slider);
                                
                                const rightColumn = $('<div>').addClass('right-column');

                                fieldset.append(radioLegend, passRadio, passLabel, failRadio, failLabel, resetButton, switchWrapper, applicableLabel);
                                

                                rightColumn.append(fieldset);

                                li.append(rightColumn);

                                const openButton = $('<button id="open-overlay" class="ws10-button-link ws10-button-link--color-primary-200 overlayKeyOff" style="grid-column-start: 1;">test instructions<svg id="icon" class="ws10-button-link__icon ws10-button-link__icon--right ws10-system-icon ws10-system-icon--size-150 ws10-system-icon--color-primary-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><polyline class="st0" points="62 28 130 96 62 164" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"/></svg></button>');
                                rightColumn.append(openButton);
                                
                                applicableCheckbox.on('change', function() {
                                    const isChecked = $(this).is(':checked');
                                    const fieldset = $(this).closest('li').find('fieldset');
                                    const selectedRadio = fieldset.find('input[type="radio"]:checked').val();
                                
                                    if (isChecked) {
                                        fieldset.prop('disabled', false);
                                        resetButton.removeClass('reset-button-icon-disabled');
                                        if (!fieldset.data('isChecked')) {
                                            fieldsetCount++;
                                        }
                                        if (selectedRadio) {
                                            selectedRadioCount++;
                                            if (selectedRadio === 'pass') {
                                                passCount++;
                                            } else if (selectedRadio === 'fail') {
                                                failCount++;
                                            }
                                        }
                                    } else {
                                        fieldset.prop('disabled', true);
                                        resetButton.addClass('reset-button-icon-disabled');
                                        if (!fieldset.data('isChecked')) {
                                            fieldsetCount = Math.max(fieldsetCount - 1, 0);
                                        }
                                        if (selectedRadio) {
                                            selectedRadioCount = selectedRadioCount > 0 ? selectedRadioCount - 1 : 0;
                                            if (selectedRadio === 'pass') {
                                                passCount = passCount > 0 ? passCount - 1 : 0;
                                            } else if (selectedRadio === 'fail') {
                                                failCount = failCount > 0 ? failCount - 1 : 0;
                                            }
                                        }
                                    }
                                    updateCounter();
                                    saveState();
                                    adjustAccordionHeights();
                                });

                                switchWrapper.on('click', function() {
                                    applicableCheckbox.prop('checked', !applicableCheckbox.prop('checked')).trigger('change');
                                });

                              // Kommentarfunktion
                              
                              const addCommentButton = $('<button id="addComment" class="overlayKeyOff">add issue<svg id="icon" class="ws10-button-link__icon ws10-button-link__icon--right ws10-system-icon ws10-system-icon--size-150 ws10-system-icon--color-primary-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><polyline class="st0" points="62 28 130 96 62 164" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"/></svg></button>').addClass('add-comment-button ws10-button-link ws10-button-link--color-primary-200');
                              const commentsDiv = $('<div><h5 class="comment-optionslegend">issues</h5>').addClass('comments').hide();
                              
                              rightColumn.append(addCommentButton);

                              li.append(commentsDiv);

                              rightColumn.append(commentsDiv);
            
                                ul.append(li);
                                fieldsetCount++;
                            }
                        });
                        dodsDiv.append(ul);
                    });
                    innerDiv.append(dodsDiv);
                }
                accordionContent.append(innerDiv);
            });
            container.append(accordionContent);
/* 
            accordionHeader.click(function() {
                const chevron = $('.accordion-toggle').find('.ws10-accordion-item__chevron');
                chevron.toggleClass('rotate');
                accordionContent.toggleClass('open');

                if (accordionContent.hasClass('open')) {
                    accordionContent.css('max-height', accordionContent[0].scrollHeight + 'px');
                } else {
                    accordionContent.css('max-height', '0');
                }
            }); */

            accordionHeader.click(function() {
                // Finde das nächstgelegene ws10-card__header-Element, das das geklickte accordion-header-Element enthält
                const cardHeader = $(this).closest('.ws10-card__header');
                
                // Finde das Chevron-Icon innerhalb dieses ws10-card__header-Elements
                const chevron = cardHeader.find('.ws10-accordion-item__chevron');
                
                // Schalte die rotate-Klasse für das gefundene Chevron-Icon um
                chevron.toggleClass('rotate');
                
                // Finde das entsprechende accordionContent (hier ist der Kontext nicht ganz klar, also anpassen wenn nötig)
                const accordionContent = cardHeader.next('.accordion-content');
                accordionContent.toggleClass('open');
            
                if (accordionContent.hasClass('open')) {
                    accordionContent.css('max-height', accordionContent[0].scrollHeight + 'px');
                } else {
                    accordionContent.css('max-height', '0');
                }
            });

            accordionToggle.click(function() {
                // Finde das nächstgelegene ws10-card__header-Element, das das geklickte accordion-header-Element enthält
                const cardHeader = $(this).closest('.ws10-card__header');
                
                // Finde das Chevron-Icon innerhalb dieses ws10-card__header-Elements
                const chevron = cardHeader.find('.ws10-accordion-item__chevron');
                
                // Schalte die rotate-Klasse für das gefundene Chevron-Icon um
                chevron.toggleClass('rotate');
                
                // Finde das entsprechende accordionContent (hier ist der Kontext nicht ganz klar, also anpassen wenn nötig)
                const accordionContent = cardHeader.next('.accordion-content');
                accordionContent.toggleClass('open');
            
                if (accordionContent.hasClass('open')) {
                    accordionContent.css('max-height', accordionContent[0].scrollHeight + 'px');
                } else {
                    accordionContent.css('max-height', '0');
                }
            });
            

            $('#content-wrapper').append(container);
        });


        // SummaryOverlay (start)
        function createSummaryOverlay() {
            const overlay = $(`
                <div class="slide-in-overlay-container">
                    <div id="summary-overlay" class="ws10-overlay ws10-fade ws10-overlay--spacing ws10-overlay--align-left" style="display: none;">
                        <div class="ws10-overlay__container">
                            <div class="ws10-overlay__close">
                                <button id="close-summary-overlay" aria-label="Close" class="ws10-button-icon-only ws10-button-icon-only--tertiary ws10-button-icon-only--floating ws10-button-icon-only--standard close">
                                    <svg id="close-icon" class="ws10-button-icon-only__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                                        <line class="st0" x1="44" y1="148" x2="148" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8.67"></line>
                                        <line class="st0" x1="148" y1="148" x2="44" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8.67"></line>
                                    </svg>
                                </button>
                            </div>
                            <div id="summaryOverlay-content" class="summary-overlay-content ws10-overlay__content"></div>
                        </div>
                    </div>
                    <div class="ws10-overlay__backdrop-white ws10-fade ws10-in" style="display: none;"></div>
                </div>
            `);
        
            $('body').append(overlay);
        }
        
        function updateSummaryOverlay() {
            const summaryOverlayContent = $('#summaryOverlay-content');
            summaryOverlayContent.empty();

            const counterContent = $('#counter').clone();
            const summaryHead = $('<div class="summaryHead"><h1>Test results according to test criteria</h1></div>');
            summaryOverlayContent.append(summaryHead);

        
            // Load Audit Information
            const auditData = JSON.parse(localStorage.getItem('auditInfo'));
            if (auditData) {
                const auditInfoSection = $(`
                    <div class="projectInfo summaryCardFlat">
                        <div class="infoContainer">
                            <h2>Audit Information</h2>
                            <p><strong>Audit name:</strong> ${auditData.auditName}</p>
                            <p><strong>Audited by:</strong> ${auditData.auditedBy}</p>
                            <p><strong>E-mail address:</strong> ${auditData.emailAddress}</p>
                            <p><strong>Audit object:</strong> ${auditData.auditObject}</p>
                            <p><strong>URL:</strong> <a href="${auditData.url}" target="_blank">${auditData.url}</a></p>
                            <p><strong>Further information:</strong> ${auditData.furtherInfo}</p>
                        </div>
                    </div>
                `);
                summaryOverlayContent.append(auditInfoSection);
            }
        
            summaryOverlayContent.append(counterContent.html());
            
            const summaryComments = $('<div class="summaryCommentsHead"><h4>Comments/issues</h4></div>');
        
            const violations = $('<div class="summary"><h5>Violation:</h5></div>');
            const recommendations = $('<div class="summary"><h5>Recommendation:</h5></div>');
            const infos = $('<div class="summary"><h5>Info:</h5></div>');
        
           
            summaryComments.append(violations).append(recommendations).append(infos);
            summaryOverlayContent.append(summaryComments);

            const notReviewed = $('<div class="summary"><h4>Nicht bearbeitet:</h4><ul id="not-reviewed-list"></ul></div>');
            const reviewed = $('<div class="summary"><h4>Geprüft:</h4><ul id="reviewed-list"></ul></div>');
            const notApplicable = $('<div class="summary"><h4>Nicht anwendbar:</h4><ul id="not-applicable-list"></ul></div>');
        
            summaryOverlayContent.append(reviewed).append(notApplicable).append(notReviewed);
            
        
            const groupedComments = {
                violation: {},
                recommendation: {},
                info: {}
            };
        
            Object.keys(groupedByCategory).forEach(category => {
                groupedByCategory[category].forEach(item => {
                    if (item.dods) {
                        Object.keys(item.dods).forEach(taskType => {
                            const tasks = item.dods[taskType];
                            tasks.forEach(task => {
                                const li = $('<li>').text(item.title);
                                if (task.taskid) {
                                    li.attr('id', task.taskid);
                                    const applicableCheckbox = $(`#applicable_${task.taskid}`);
                                    if (!applicableCheckbox.is(':checked')) {
                                        // Nicht anwendbar
                                        li.append(`<div>Role: ${task.roletitle}</div>`);
                                        li.append(`<div>Task: ${task.taskdesc}</div>`);
                                        $('#not-applicable-list').append(li);
                                    } else {
                                        const passRadio = $(`#pass_${task.taskid}`);
                                        const failRadio = $(`#fail_${task.taskid}`);
                                        if (passRadio.is(':checked')) {
                                            // Geprüft: pass
                                            li.append(': pass');
                                            li.append(`<div>Role: ${task.roletitle}</div>`);
                                            li.append(`<div>Task: ${task.taskdesc}</div>`);
                                            $('#reviewed-list').append(li);
                                        } else if (failRadio.is(':checked')) {
                                            // Geprüft: fail
                                            li.append(': fail');
                                            li.append(`<div>Role: ${task.roletitle}</div>`);
                                            li.append(`<div>Task: ${task.taskdesc}</div>`);
                                            $('#reviewed-list').append(li);
                                        } else {
                                            // Nicht bearbeitet
                                            li.append(`<div>Role: ${task.roletitle}</div>`);
                                            li.append(`<div>Task: ${task.taskdesc}</div>`);
                                            $('#not-reviewed-list').append(li);

                                    
                                        }
                                        
                                    
                                    
         
        
                                    
                                        // Kommentare hinzufügen, unabhängig vom Radio-Button-Status
                                        const comments = JSON.parse(localStorage.getItem('filterState')).comments[task.taskid] || [];
                                        comments.forEach(comment => {
                                            if (!groupedComments[comment.type][item.bitv + item.title]) {
                                                groupedComments[comment.type][item.bitv + item.title] = {
                                                    bitv: item.bitv,
                                                    title: item.title,
                                                    comments: []
                                                };
                                            }
                                            groupedComments[comment.type][item.bitv + item.title].comments.push({
                                                title: comment.title,
                                                text: comment.text,
                                                type: comment.type,
                                                images: comment.images
                                            });
                                        });
                                    }
                                }
                            });
                        });
                    }
                });
            });
        
            // Anpassung der groupedComments für Anker und Links
            Object.keys(groupedComments).forEach(commentType => {
                Object.keys(groupedComments[commentType]).forEach(key => {
                    const group = groupedComments[commentType][key];
                    const header = $(`<div>${group.bitv} - ${group.title}</div>`);
                    const ul = $('<ul>');
                    group.comments.forEach(comment => {
                        const anchorId = `${group.bitv}-${comment.type}-${comment.title}`.replace(/\s+/g, '-');
                        ul.append($('<li>').append(`<a href="#${anchorId}">${comment.title}</a>`));
                    });
                    if (commentType === 'violation') {
                        violations.append(header).append(ul);
                    } else if (commentType === 'recommendation') {
                        recommendations.append(header).append(ul);
                    } else if (commentType === 'info') {
                        infos.append(header).append(ul);
                    }
                });
            });
        
            // Detailed Comments Section
            const detailedCommentsSection = $('<div class="summarySectionDetailed"><h4>Detailed Comments:</h4></div>');
        
            Object.keys(groupedComments).forEach(commentType => {
                Object.keys(groupedComments[commentType]).forEach(key => {
                    const group = groupedComments[commentType][key];
                    group.comments.forEach(comment => {
                        const anchorId = `${group.bitv}-${comment.type}-${comment.title}`.replace(/\s+/g, '-');
                        const commentBlock = $(`
                            <div id="${anchorId}">
                                <strong>${comment.title}</strong>
                                <div>Prüfschritt: ${group.bitv} - ${group.title}</div>
                                <div>Art des Issues: ${comment.type}</div>
                                <div>${comment.text}</div>
                                <div class="comment-images">${comment.images.map(src => `<img src="${src}" class="comment-image-thumbnail">`).join('')}</div>
                            </div>
                        `);
                        detailedCommentsSection.append(commentBlock);
                    });
                });
            });
        
            summaryComments.append(detailedCommentsSection);
            
            
        }
        
        function openSummaryOverlay() {
            updateSummaryOverlay();
            $('#summary-overlay').css('display', 'block').addClass('ws10-in');
            $('.ws10-overlay__backdrop-white').css('display', 'block').addClass('ws10-in');
            $('.ws10-overlay__container').css('transform', 'translateX(-50%) translateY(-50%)');
            $('body').addClass('ws10-no-scroll');
        }
        
        $(document).on('click', '#open-summary-overlay', function() {
            openSummaryOverlay();
        });
        
        function closeSummaryOverlay() {
            $('#summary-overlay').removeClass('ws10-in').css('display', 'none');
            $('.ws10-overlay__backdrop-white').removeClass('ws10-in').css('display', 'none');
            $('body').removeClass('ws10-no-scroll');
            $('.ws10-overlay__container').css('transform', 'translateX(0) translateY(0)');
        }
        
        $(document).on('click', '#close-summary-overlay', function() {
            closeSummaryOverlay();
        });
        
        $(document).on('click', '.ws10-overlay__backdrop-white', function() {
            closeSummaryOverlay();
        });
        
        createSummaryOverlay();
        
        

        // SummaryOverlay (end)


        $('#content-wrapper').append($('<div>').attr('id', 'counter'));
        updateCounter();
        adjustAccordionHeights();
        setFiltersFromQueryString();
        loadState();
        applyFilters();

        $('input[type="radio"]:checked').each(function() {
            const fieldset = $(this).closest('fieldset');
            if ($(this).val() === 'pass') {
                // passCount++;
            } else if ($(this).val() === 'fail') {
                // failCount++;
            }
            if (!fieldset.data('isChecked')) {
                // selectedRadioCount++;
                fieldsetCount = Math.max(fieldsetCount - 1, 0);
                fieldset.data('isChecked', true);
            }
        });
        

        $('input[type="checkbox"][id^="applicable_"]:not(:checked)').each(function() {
            const fieldset = $(this).closest('li').find('fieldset');
            if (!fieldset.data('isChecked')) {
                fieldsetCount = Math.max(fieldsetCount - 1, 0);
            }
        });

        updateCounter();
        console.log("Am Ende " + fieldsetCount);
    }).fail(function(jqxhr, textStatus, error) {
        console.error("Request Failed: " + textStatus + ", " + error);

  
        



    
     
        


    });
});
