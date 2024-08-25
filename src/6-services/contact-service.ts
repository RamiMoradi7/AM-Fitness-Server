import { contactMail } from "../3-config/mailer";
import { ValidationError } from "../4-models/client-errors";
import { Contact, IContact } from "../4-models/contact";

class ContactService {
  public async getContacts(): Promise<IContact[]> {
    const contacts = await Contact.find().exec();
    if (!contacts) throw new ValidationError("No contacts found.");
    return contacts;
  }

  public async handleContactForm(contactData: IContact): Promise<void> {
    const errors = contactData.validateSync();
    if (errors) throw new ValidationError(errors.message);

    contactData.createdAt = new Date();
    await contactData.save();

    const { fullName, email, message, phone } = contactData;
    await contactMail(
      email,
      "New Contact Form Submission",
      ` Name: ${fullName} 
        Email: ${email} 
        Phone: ${phone}
        Message: ${message}.`
    );
  }
}

export const contactService = new ContactService();
