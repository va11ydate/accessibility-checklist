class AuditInfoOverlay {
    constructor() {
        this.initOverlay();
        this.bindEvents();
        this.loadState();
    }

    initOverlay() {
        this.auditOverlay = $(this.getOverlayTemplate());
        $('body').append(this.auditOverlay);
    }

    bindEvents() {
        const events = [
            { selector: '#addAuditInfo', event: 'click', handler: this.showAddAuditOverlay },
            { selector: '#startAudit', event: 'click', handler: this.showAddAuditOverlay },
            { selector: '#editAuditInfo', event: 'click', handler: this.showAddAuditOverlay },
            { selector: '#deleteAuditInfo', event: 'click', handler: this.deleteAuditInfo },
            { selector: '#save-audit-info', event: 'click', handler: this.saveAuditInfo },
            { selector: '#cancel-audit-info', event: 'click', handler: this.hideOverlay },
            { selector: '#audit-object', event: 'change', handler: this.updateNameField },
        ];

        events.forEach(({ selector, event, handler }) => {
            $(document).on(event, selector, (e) => handler.call(this, e));
        });
    }

    getInitials(fullName) {
        if (!fullName) return 'AU';
        const parts = fullName.trim().split(/\s+/);
        const initials = parts.map(n => n.charAt(0).toUpperCase()).join('');
        return initials || 'AU';
    }

    updateNameField() {
        const selectedValue = $('#audit-object').val();
        const $label = $('label[for="page-name"], label[for="pattern-name"], label[for="email-name"]');
        const $input = $('#page-name, #pattern-name, #email-name');

        const currentValue = $input.val();

        let newLabelText = 'Page name';
        let newId = 'page-name';
        let newName = 'page-name';

        if (selectedValue === 'pattern') {
            newLabelText = 'Pattern name';
            newId = 'pattern-name';
            newName = 'pattern-name';
        } else if (selectedValue === 'email') {
            newLabelText = 'E-mail name';
            newId = 'email-name';
            newName = 'email-name';
        }

        $label.text(newLabelText).attr('for', newId);
        $input.attr('id', newId).attr('name', newName).val(currentValue);
    }

    getOverlayTemplate() {
        return `
            <div class="slide-in-overlay-container">
                <div id="audit-overlay" class="ws10-overlay ws10-fade ws10-overlay--slide ws10-overlay--spacing ws10-overlay--align-left ws10-in" style="display: none;">
                    <div class="ws10-overlay__container">
                        <div class="ws10-overlay__close">
                            <button id="cancel-audit-info" aria-label="Cancel audit info" class="ws10-button-icon-only ws10-button-icon-only--tertiary ws10-button-icon-only--floating ws10-button-icon-only--standard close overlayKeyOn" tabindex="1">
                                <svg id="close-icon" class="ws10-button-icon-only__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                                    <line class="st0" x1="44" y1="148" x2="148" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8.67"></line>
                                    <line class="st0" x1="148" y1="148" x2="44" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8.67"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="audit-overlay-content ws10-overlay__content">
                            <h1 class="span-h4" style="margin-bottom:16px;">Add project info</h1>
                            ${this.getAuditFormTemplate()}
                        </div>
                        ${this.getButtonsTemplate()}
                    </div>
                </div>
                ${this.getBackdropTemplate()}
            </div>
        `;
    }

    getAuditFormTemplate() {
        return `
            <div class="ws10-form-element-block ws10-form-element-block--text-input">
                <div class="ws10-form-element-block__label-container">
                    <label for="audit-name" class="ws10-form-label">Project name</label>
                </div>
                <div class="ws10-form-element-block__input-container">
                    <input type="text" id="audit-name" name="audit-name" class="form-text-input"/>
                </div>
            </div>
            <div class="ws10-form-element-block ws10-form-element-block--text-input">
                <div class="ws10-form-element-block__label-container">
                    <label for="audited-by" class="ws10-form-label">Checked by</label>
                </div>
                <div class="ws10-form-element-block__input-container">
                    <input type="text" id="audited-by" name="audited-by" class="form-text-input"/>
                </div>
            </div>
            <div class="ws10-form-element-block ws10-form-element-block--text-input">
                <div class="ws10-form-element-block__label-container">
                    <label for="email-address" class="ws10-form-label">E-mail address</label>
                </div>
                <div class="ws10-form-element-block__input-container">
                    <input type="email" id="email-address" name="email-address" class="form-text-input"/>
                </div>
            </div>
            <div class="ws10-form-element-block ws10-form-element-block--select">
                <div class="ws10-form-element-block__label-container">
                    <label for="audit-object" class="ws10-form-label">Object</label>
                </div>
                <div class="ws10-form-element-block__input-container">
                    <select id="audit-object" class="ws10-form-select ws10-form-select__select">
                        <option value="web-page">Web page</option>
                        <option value="pattern">Pattern</option>
                        <option value="app">App</option>
                        <option value="email">E-mail</option>
                    </select>
                    <span class="ws10-form-select__notification_icon-container">
                        <svg aria-hidden="true" class="ws10-form-select__chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                            <polyline class="st0" points="164 62 96 130 28 62" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"></polyline>
                        </svg>
                    </span>
                </div>
            </div>
            <!-- Standardmäßig Page name -->
            <div class="ws10-form-element-block ws10-form-element-block--text-input">
                <div class="ws10-form-element-block__label-container">
                    <label for="page-name" class="ws10-form-label">Page name</label>
                </div>
                <div class="ws10-form-element-block__input-container">
                    <input type="text" id="page-name" name="page-name" class="form-text-input"/>
                </div>
            </div>
            <div class="ws10-form-element-block ws10-form-element-block--text-input">
                <div class="ws10-form-element-block__label-container">
                    <label for="url" class="ws10-form-label">URL</label>
                </div>
                <div class="ws10-form-element-block__input-container">
                    <input type="url" id="url" name="url" class="form-text-input"/>
                </div>
            </div>
            <div class="ws10-form-element-block ws10-form-element-block--textarea">
                <div class="ws10-form-element-block__label-container">
                    <label for="further-info" class="ws10-form-label">Further information</label>
                </div>
                <div class="ws10-form-element-block__input-container">
                    <div class="ws10-form-textarea">
                        <textarea id="further-info" rows="5" class="ws10-form-textarea__textarea"></textarea>
                    </div>
                </div>
            </div>
        `;
    }

    getButtonsTemplate() {
        return `
            <div class="overlayButtonsContainer">
                <button id="save-audit-info" class="ws10-secondary-button element50percentwidth">Save & Close</button>
                <button id="cancel-audit-info" class="ws10-alt-button element50percentwidth">Cancel</button>
            </div>
        `;
    }

    getBackdropTemplate() {
        return `<div class="ws10-overlay__backdropAudit ws10-fade ws10-in"></div>`;
    }

    showAddAuditOverlay(e) {
        e.stopPropagation();
        const auditData = this.loadAuditData();
        if (auditData) {
            $('#audit-name').val(auditData.auditName);
            $('#audited-by').val(auditData.auditedBy);
            $('#email-address').val(auditData.emailAddress);
            $('#audit-object').val(auditData.auditObject);
            $('#page-name').val(auditData.pageName);
            $('#url').val(auditData.url);
            $('#further-info').val(auditData.furtherInfo);
        } else {
            $('#audit-name').val('');
            $('#audited-by').val('');
            $('#email-address').val('');
            $('#audit-object').val('web-page');
            $('#page-name').val('');
            $('#url').val('');
            $('#further-info').val('');
        }

        // Unmittelbar beim Öffnen prüfen, ob wir das Label/Feld anpassen müssen
        this.updateNameField();

        $('#audit-overlay').show();
        this.toggleBackdrop(true);
    }

    saveAuditInfo(e) {
        e.stopPropagation();
        const $nameField = $('#page-name, #pattern-name, #email-name');

        const auditData = {
            auditName: $('#audit-name').val().trim(),
            auditedBy: $('#audited-by').val().trim(),
            emailAddress: $('#email-address').val().trim(),
            auditObject: $('#audit-object').val(),
            pageName: $nameField.val().trim(),
            url: $('#url').val().trim(),
            furtherInfo: $('#further-info').val().trim()
        };

        $('#addAuditInfo').text('Edit audit info');
        $('#startAudit').replaceWith('<div class="auditTitle">' + auditData.auditName + '</div>');
        localStorage.setItem('auditInfo', JSON.stringify(auditData));

        this.displayAuditInfo(auditData);
        $('.profile-link').text(auditData.auditedBy || 'Accessibility User');

        const initials = this.getInitials(auditData.auditedBy);
        $('.avatar').text(initials);

        this.hideOverlay();
    }

    /**
     * Neben dem restlichen Audit-Info-Text soll hier auch das Label für Page/Pattern/Email
     * an der passenden Stelle angezeigt werden.
     */
    displayAuditInfo(data) {
        // Dynamische Überschrift für "pageName" in Abhängigkeit von data.auditObject
        let nameLabel = 'Page name';
        if (data.auditObject === 'pattern') {
            nameLabel = 'Pattern name';
        } else if (data.auditObject === 'email') {
            nameLabel = 'E-mail name';
        }

        const container = $('#audit-info-container');
        container.html(`
            <div class="projectInfo cardFlat">
                <div class="infoContainer">
                    <h4>Project information</h4>
                    <p><strong>Project name:</strong> ${data.auditName}</p>
                    <p><strong>Checked by:</strong> ${data.auditedBy}</p>
                    <p><strong>E-mail address:</strong> ${data.emailAddress}</p>
                    <p><strong>Object:</strong> ${data.auditObject}</p>
                    <p><strong>${nameLabel}:</strong> ${data.pageName}</p>
                    <p><strong>URL:</strong> <a href="${data.url}" target="_blank">${data.url}</a></p>
                    <p><strong>Further information:</strong> ${data.furtherInfo}</p>
                </div>
                <div class="infoTools">
                    <button id="editAuditInfo" class="overlayKeyOff commentFunctionsButtons">
                        <svg class="icon24" id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                            <polyline class="st0" points="147.38 70.11 121.57 44.02 36.49 129.1 27.77 164 62.67 155.27 147.38 70.11" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"></polyline>
                            <path class="st0" d="M121.57,44l12.79-12.79a11,11,0,0,1,15.63,0l18,18.22L147.38,70.11" fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8"></path>
                            <line class="st0" x1="39.55" y1="126.1" x2="65.73" y2="152.28" fill="none" stroke-miterlimit="10" stroke-width="8"></line>
                        </svg>
                    </button>
                    <button id="deleteAuditInfo" class="overlayKeyOff commentFunctionsButtons">
                        <svg id="icon" class="icon24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
                            <line class="st0" x1="112.01" y1="144" x2="112.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"></line>
                            <line class="st0" x1="80.01" y1="144" x2="80.01" y2="72" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"></line>
                            <line class="st0" x1="36" y1="44" x2="156" y2="44" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"></line>
                            <path class="st0" d="M120,44V36a16,16,0,0,0-16-16H88A16,16,0,0,0,72,36v8" fill="none" stroke-linejoin="round" stroke-width="8"></path>
                            <path class="st0" d="M148,44V156a16,16,0,0,1-16,16H60a16,16,0,0,1-16-16V44" fill="none" stroke-linejoin="round" stroke-width="8"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `);
        console.log('Displayed Audit Info:', data); // Debug-Ausgabe
    }

    hideOverlay() {
        $('#audit-overlay').hide();
        this.toggleBackdrop(false);
    }

    deleteAuditInfo(e) {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete the Audit information?')) {
            const AuditInfoItem = $(e.currentTarget).closest('.projectInfo');
            AuditInfoItem.remove();
            localStorage.removeItem('auditInfo');
            $('#addAuditInfo').text('Add audit info');
            $('#startAudit').replaceWith('<button class="ws10-secondary-button overlayKeyOff" id="startAudit">Add project info</button>');

            $('.profile-link').text('Accessibility User');
            $('.avatar').text('AU');
        }
    }

    toggleBackdrop(show) {
        const display = show ? 'block' : 'none';
        $('.ws10-overlay__backdropAudit').css('display', display);
        $('body').toggleClass('ws10-no-scroll', show);
    }

    loadState() {
        const auditData = this.loadAuditData();
        if (auditData) {
            this.displayAuditInfo(auditData);
            $('#addAuditInfo').text('Edit audit info');
            $('#startAudit').replaceWith('<div class="auditTitle">' + auditData.auditName + '</div>');
            $('.profile-link').text(auditData.auditedBy || 'Accessibility User');
            $('.avatar').text(this.getInitials(auditData.auditedBy));
        }
    }

    loadAuditData() {
        return JSON.parse(localStorage.getItem('auditInfo'));
    }
}

$(document).ready(() => {
    new AuditInfoOverlay();
});
