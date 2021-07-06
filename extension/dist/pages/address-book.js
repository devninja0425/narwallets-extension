const ADDRESS_BOOK = "addressbook";
import { askBackground, askBackgroundAddContact, askBackgroundAllAddressContact, } from "../background/askBackground.js";
import { GContact } from "../data/Contact.js";
import * as d from "../util/document.js";
import { hideOkCancel, OkCancelInit, showOKCancel, } from "../util/okCancel.js";
export let addressContacts = [];
let selectedContactIndex = NaN;
export async function show() {
    addressContacts = [];
    d.onClickId("add-contact", showAddContactPage);
    d.onClickId("remove-contact", deleteContact);
    d.onClickId("edit-contact", editContact);
    d.onClickId("back-to-addressbook", backToAddressBook);
    OkCancelInit();
    hideOkCancel();
    d.clearContainer("address-list");
    await initAddressArr();
    showInitial();
}
export async function initAddressArr() {
    const addressRecord = await askBackgroundAllAddressContact();
    for (let key in addressRecord) {
        addressContacts.push(new GContact(key, addressRecord[key].note));
    }
}
function backToAddressBook() {
    showInitial();
}
function showAddContactPage() {
    d.showPage("add-addressbook");
    showOKCancel(addOKClicked, showInitial);
}
function showInitial() {
    d.clearContainer("address-list");
    d.populateUL("address-list", "address-item-template", addressContacts);
    document.querySelectorAll("#address-list .address-item").forEach((item) => {
        item.addEventListener("click", showAddressDetails);
    });
    d.showPage(ADDRESS_BOOK);
    d.showSubPage("main-contact");
}
async function addOKClicked() {
    try {
        const addressToSave = new d.El("#add-addresbook-id").value;
        const noteToSave = new d.El("#add-addresbook-note").value;
        const contactToSave = {
            accountId: addressToSave,
            note: noteToSave,
        };
        addressContacts.forEach((address) => {
            if (address.accountId == addressToSave) {
                throw Error("Address already saved");
            }
        });
        addressContacts.push(contactToSave);
        await saveContactOnBook(addressToSave, contactToSave);
        hideOkCancel();
        showInitial();
        d.showSuccess("Contact added correctly");
    }
    catch (ex) {
        d.showErr(ex);
    }
}
export async function saveContactOnBook(name, contact) {
    return askBackgroundAddContact(name, contact);
}
function showAddressDetails(ev) {
    d.clearContainer("selected-contact");
    if (ev.target && ev.target instanceof HTMLElement) {
        const li = ev.target.closest("li");
        if (li) {
            const index = Number(li.id);
            if (isNaN(index))
                return;
            let contact = addressContacts[index];
            d.appendTemplateLI("selected-contact", "selected-contact-template", contact);
            selectedContactIndex = index;
        }
    }
    d.byId("bottombar-addressbook").classList.remove("hidden");
    d.showPage("addressbook-details");
}
function deleteContact() {
    if (isNaN(selectedContactIndex))
        return;
    d.byId("bottombar-addressbook").classList.add("hidden");
    d.showSubPage("contact-remove-selected");
    showOKCancel(okDeleteContact, showInitial);
}
async function okDeleteContact() {
    await askBackground({
        code: "remove-address",
        accountId: addressContacts[selectedContactIndex].accountId,
    });
    addressContacts.splice(selectedContactIndex, 1);
    showInitial();
    hideOkCancel();
}
function editContact() {
    d.byId("bottombar-addressbook").classList.add("hidden");
    d.showSubPage("contact-edit-selected");
    d.inputById("edit-note-contact").value =
        addressContacts[selectedContactIndex].note || "";
    showOKCancel(addNoteOKClicked, showInitial);
}
async function addNoteOKClicked() {
    addressContacts[selectedContactIndex].note = d
        .inputById("edit-note-contact")
        .value.trim();
    //Guardo
    await askBackground({
        code: "set-address-book",
        accountId: addressContacts[selectedContactIndex].accountId,
        contact: addressContacts[selectedContactIndex],
    });
    showInitial();
    hideOkCancel();
}
//# sourceMappingURL=address-book.js.map