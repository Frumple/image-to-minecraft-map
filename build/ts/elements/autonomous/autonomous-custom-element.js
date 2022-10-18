var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetchFromFile } from '@helpers/file-helpers';
import { toKebabCase } from '@helpers/string-helpers';
export default class AutonomousCustomElement extends HTMLElement {
    constructor() {
        var _a;
        super();
        this.isInitialized = false;
        this.attachShadow({ mode: 'open' });
        const fragment = document.createRange().createContextualFragment(AutonomousCustomElement.htmlContent);
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.appendChild(fragment.cloneNode(true));
    }
    static get elementName() {
        throw new Error(`The class '${this.name}' must implement the elementName() getter.`);
    }
    static define() {
        return __awaiter(this, void 0, void 0, function* () {
            if (customElements.get(this.elementName) === undefined) {
                AutonomousCustomElement.htmlContent = yield fetchFromFile(this.htmlPath);
                customElements.define(this.elementName, this);
            }
        });
    }
    static get htmlPath() {
        const kebab = toKebabCase(this.name);
        return `/elements/autonomous/containers/${kebab}.html`;
    }
    connectedCallback() {
        if (this.isConnected && !this.isInitialized) {
            this.initialize();
            this.isInitialized = true;
        }
    }
    initialize() {
        // Implemented by subclasses
    }
    getShadowElement(id) {
        var _a;
        const element = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById(id);
        if (element === null) {
            throw new Error(`Could not find element with id '${id}'.`);
        }
        return element;
    }
}
AutonomousCustomElement.htmlContent = '';
