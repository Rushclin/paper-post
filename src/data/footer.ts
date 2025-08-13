import { ISocials } from "../types/footer";
import { IMenuItem } from "../types/menu";

export const footerDetails: {
    subheading: string;
    quickLinks: IMenuItem[];
    email: string;
    telephone: string;
    socials: ISocials;
} = {
    subheading: "Publiez vos articles, journaux et revues scientifiques dans un même endroit.",
    quickLinks: [
        {
            text: "Catégories",
            url: "/catégories"
        },
        {
            text: "Articles",
            url: "/articles"
        },
        {
            text: "Auteurs",
            url: "/auteurs"
        }
    ],
    email: 'fxavier@gmail.com',
    telephone: '+1 (237) 67192029',
    socials: {
        twitter: 'https://twitter.com/Twitter',
        facebook: 'https://facebook.com',
        linkedin: 'https://www.linkedin.com',
        instagram: 'https://www.instagram.com',
    }
}