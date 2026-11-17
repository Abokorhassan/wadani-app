# Google Play release

Everything needed to fill in Play Console. Answers are based on what the app
actually collects (registration form, payments, photo upload).

## Before the first build

- [ ] Deploy the web app (legal pages use wadaniparty2026@gmail.com and
      +252 65 3140475).
- [ ] Check these open: `https://wp-membership-system.com/privacy`, `/terms`,
      `/delete-account`.
- [ ] Deploy the backend with commit `bc559e3` (Sifalo local wallet numbers) and
      make one live Waafi registration.
- [ ] Rotate the AWS key (handover §8).

## Build and upload

```sh
eas login
eas init                  # fills extra.eas.projectId in app.json
eas env:create --environment production --visibility sensitive --name EXPO_PUBLIC_AWS_ACCESS_KEY_ID --value <key>
eas env:create --environment production --visibility sensitive --name EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY --value <secret>
eas build -p android --profile production
```

Let EAS generate the keystore. Upload the first `.aab` by hand to
**Testing → Internal testing**. Later builds: `eas submit -p android`.

## Store listing

Graphics are in `assets/store/` (made by `npm run brand:assets`). Screenshots:
at least 2 phone screenshots (Welcome, Home, Card, Payments, News).

- **App name:** Waddani Party
- **Category:** Social
- **Short description (80 max)**
  - EN: Join Xisbiga Waddani, carry your membership card and pay your dues.
  - SO: Ku biir Xisbiga Waddani, hel kaadhkaaga xubinnimada, bixi lacagta xubinnimada.
- **Full description**

  EN:

  > The official membership app of Xisbiga Waddani, the Somaliland National Party.
  >
  > - Register as a member in a few minutes
  > - Pay your membership fee with Zaad, EVC, eDahab, Premier Wallet or card
  > - Carry your digital membership card with its QR code, and save it to your photos
  > - See your payment history and renew when it is due
  > - Donate to support the party's work
  > - Follow party news and events
  > - Use the app in English or Somali

  SO:

  > App-ka rasmiga ah ee xubinnimada Xisbiga Waddani.
  >
  > - Iska diiwaangeli xubin dhawr daqiiqo gudahood
  > - Ku bixi lacagta xubinnimada Zaad, EVC, eDahab, Premier Wallet ama kaadh
  > - Hel kaadhkaaga xubinnimada ee QR-ka leh, kuna kaydi sawiradaada
  > - Arag taariikhda lacag-bixintaada, cusboonaysiina marka la gaadho
  > - Ku deeq si aad u taageerto hawlaha xisbiga
  > - La soco wararka iyo munaasabadaha xisbiga
  > - Ku isticmaal app-ka Ingiriisi ama Soomaali

  The Somali text is a draft: have a native speaker review it with the in-app copy (D13).

- **Privacy policy:** `https://wp-membership-system.com/privacy`

## App content (Policy → App content)

| Form               | Answer                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| Privacy policy     | `https://wp-membership-system.com/privacy`                                                                     |
| Ads                | No ads                                                                                                         |
| App access         | All or some functionality is restricted → give a working test member's phone/email and password                |
| Content rating     | Category: Social. No violence, sexual content, profanity, drugs or gambling. Users don't chat with each other. |
| Target audience    | 18 and over. Not designed for children.                                                                        |
| News app           | No (party updates, not a news publisher)                                                                       |
| Government app     | No                                                                                                             |
| Financial features | None (it takes membership fees, it isn't a financial service)                                                  |
| Health             | None                                                                                                           |

### Data safety

- Collects data: **Yes**. Shares data: **No** (Sifalo and AWS act on our
  behalf, which Play doesn't count as sharing).
- Encrypted in transit: **Yes**.
- Users can request deletion: **Yes**, URL
  `https://wp-membership-system.com/delete-account`.

| Data type                      | What                                    | Required?                         | Purpose                                      |
| ------------------------------ | --------------------------------------- | --------------------------------- | -------------------------------------------- |
| Name                           | Full name                               | Required                          | App functionality, Account management        |
| Email address                  | Email                                   | Required                          | Account management, Developer communications |
| Phone number                   | Phone, WhatsApp                         | Phone required, WhatsApp optional | Account management, Developer communications |
| Address                        | Street, district, city, region, country | Required                          | App functionality                            |
| User IDs                       | Member ID, card number                  | Required                          | App functionality, Account management        |
| Political or religious beliefs | Party membership itself                 | Required                          | App functionality                            |
| Other info                     | Gender, birth year, education, work     | Required                          | App functionality                            |
| Photos                         | Membership card photo                   | Required                          | App functionality                            |
| Purchase history               | Fees and donations paid                 | Required                          | App functionality                            |
| Other financial info           | Wallet number charged                   | Required                          | App functionality                            |

Not collected: location, contacts, messages, app activity, device IDs. Card
numbers are typed into Sifalo's own checkout page, never into the app.

## Account deletion

Play requires deletion from inside the app and from the web. The app's Profile
screen has **Delete my account**, which opens the web page. Deletion is by
request (WhatsApp or email). If the backend later adds an endpoint, replace the
link with an in-app button.
