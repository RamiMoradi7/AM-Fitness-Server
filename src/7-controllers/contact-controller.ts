import express, { NextFunction, Request, Response } from "express";
import { Contact } from "../4-models/contact";
import { StatusCode } from "../4-models/enums";
import { contactService } from "../6-services/contact-service";

class ContactController {
  public readonly router = express.Router();

  // Register routes once:
  public constructor() {
    this.registerRoutes();
  }

  // Register routes:
  private registerRoutes(): void {
    this.router.post("/contact-us/", this.handleContact);
    this.router.get("/contacts", this.getContacts);
  }

  private async handleContact(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const contact = new Contact(request.body);
      const savedContact = await contactService.handleContactForm(contact);
      response
        .status(StatusCode.OK)
        .json({ success: "Form has been submitted successfully." });
    } catch (err: any) {
      next(err);
    }
  }
  private async getContacts(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const contacts = await contactService.getContacts();
      response.json(contacts);
    } catch (err: any) {
      next(err);
    }
  }
}

const contactController = new ContactController();
export const contactRouter = contactController.router;
