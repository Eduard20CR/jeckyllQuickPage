class JeckyllQuickGenerator {
  // selectors
  selector_textAreaInput = "#main";
  selector_textAreaResult = "#markdown";
  selector_submitButton = "#btnSubmit";
  selector_selectLayout = "#layout";
  selector_selectDirection = "#direction";
  selector_selectLanguage = "#language";
  selector_selectSlideshow = "#slideshow";
  selector_inputNumberOrder = "#order";
  // regex
  regularExpresionSup = /.(?<=([a-zA-z]|\)|\})(:|\.|[a-zA-z]|\?)[0-9])(,?[0-9]?){0,30}/g;
  regularExpresionLinks = /(<<).+(>>)/g;
  regularExpresionUrls = /(https|http)?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%,_\+.~#?&//=]*)/g;
  // variables
  arriveReferences = false;

  constructor() {
    this.setUpListeners();
  }

  start(inputValue) {
    const fixedText = this.prepareText(inputValue);
    const splitedByParagraph = this.splitByParagraph(fixedText);

    const frontMatterAdded = this.prepareFrontMatter(splitedByParagraph);
    const titlesAdded = this.prepareTitles(frontMatterAdded);
    const bulletsAdded = this.prepareBullets(titlesAdded);
    const registerMarkSup = this.prepareRegisterMark(bulletsAdded);
    const introductionPrepared = this.prepareIntroduction(registerMarkSup);
    const disclaimerPrepared = this.prepareDisclaimer(introductionPrepared);
    const bodyCopyPrepared = this.prepareBodyCopy(disclaimerPrepared);
    const referencesHeaderPrepared = this.prepareReferencesHeader(bodyCopyPrepared);
    const numbersWithSupPrepared = this.prepareSupNumbersReferences(referencesHeaderPrepared);
    const referencesLinksPrepared = this.prepareLinksReferences(numbersWithSupPrepared);
    const patientInformationLeadfleatPrepared = this.preparePatientInformationLeafleat(referencesLinksPrepared);

    this.setFinalMarkDown(patientInformationLeadfleatPrepared.join("\n"));
    this.resetVariables();
  }

  // PREPARE TEXT
  prepareFrontMatter(stringArr) {
    return stringArr.map((string) => {
      if (string.startsWith("Article Title")) {
        const title = string.replace("Article Title", "").trim();
        const options = this.getOptionsValues();

        const text = `
        ---
          layout: ${options.layout}
          title: ${title}
          ${options.direction ? `direction: ${options.direction}` : ``}
          ${options.language ? `lang: ${options.language}` : ``}
          isSlideshow: ${options.slideShow}
          order: ${options.order ? options.order : 0}
        ---`
          .split("\n")
          .map((s) => s.trim())
          .join("\n");
        return text;
      } else {
        return string;
      }
    });
  }
  prepareTitles(stringArr) {
    return stringArr.map((string) => {
      if (string.startsWith("Subheader")) {
        const title = string.replace("Subheader", "##").trim();
        return title;
      } else {
        return string;
      }
    });
  }
  prepareBullets(stringArr) {
    return stringArr.map((string) => {
      if (string.startsWith("•")) {
        const bullets = string.replace("•", "-").trim();
        return bullets;
      } else {
        return string;
      }
    });
  }
  prepareRegisterMark(stringArr) {
    return stringArr.map((string) => {
      if (string.includes("®")) {
        const registerMark = string.replaceAll("®", (x) => {
          return `<sup>${x}</sup>`;
        });
        return registerMark;
      } else {
        return string;
      }
    });
  }
  prepareIntroduction(stringArr) {
    return stringArr.map((string) => {
      if (string.startsWith("Introduction")) {
        const introduction = string.replace("Introduction", "").trim();
        return introduction;
      } else {
        return string;
      }
    });
  }
  prepareDisclaimer(stringArr) {
    return stringArr.map((string) => {
      if (string.startsWith("Disclaimer")) {
        const introduction = string.replace("Disclaimer", "").trim();
        return introduction;
      } else {
        return string;
      }
    });
  }
  prepareBodyCopy(stringArr) {
    return stringArr.map((string) => {
      if (string.startsWith("Body copy")) {
        const bodyCopy = string.replace("Body copy", "").trim();
        return bodyCopy;
      } else {
        return string;
      }
    });
  }
  prepareSupNumbersReferences(stringArr) {
    const stringArrReturn = stringArr.map((string) => {
      if (string.includes("{: .references}")) this.arriveReferences = true;
      if (string.match(this.regularExpresionSup) && !this.arriveReferences) {
        const supNumber = string.replaceAll(this.regularExpresionSup, (x) => `<sup>${x}</sup>`).trim();
        return supNumber;
      } else {
        return string;
      }
    });
    this.arriveReferences = false;
    return stringArrReturn;
  }
  prepareReferencesHeader(stringArr) {
    return stringArr.map((string) => {
      if (string.includes("Reference Block") || string.includes("Reference(s)")) {
        const refHeader = `
          <div class="border"></div>
            Reference(s)
          {: .references}\n`
          .split("\n")
          .map((s) => s.trim())
          .join("\n");
        return refHeader;
      } else {
        return string;
      }
    });
  }
  prepareLinksReferences(stringArr) {
    const stringArrReturn = stringArr.map((string, i) => {
      if (string.includes("{: .references}")) this.arriveReferences = true;
      const linkSection = string.match(this.regularExpresionLinks);
      if (linkSection && this.arriveReferences) {
        const url = linkSection[0].match(this.regularExpresionUrls)[0];

        const mdUrl = `[${url}](${url.replace("https://", "externalWeb//:")})`;
        let newString;
        if (string.includes(url + " ")) {
          newString = string.replace(linkSection, "").replace(url + " ", mdUrl);
        } else {
          newString = string.replace(linkSection, "").replace(url, mdUrl);
        }
        return newString;
      } else {
        return string;
      }
    });
    this.arriveReferences = false;
    return stringArrReturn;
  }
  preparePatientInformationLeafleat(stringArr) {
    return stringArr.map((string) => {
      if (string.includes("Patient Information Leaflet<<Links to Patient Info Leaflet PDF>>")) {
        const introduction = string
          .replace("Patient Information Leaflet<<Links to Patient Info Leaflet PDF>>", "[Patient Information Leaflet](inApp//:More/PILBanner)")
          .trim();
        return introduction;
      } else {
        return string;
      }
    });
  }

  // MANIPULATE TEXT
  splitByParagraph(string) {
    return string.split("\n").map((text) => text.trim());
  }
  prepareText(string) {
    return string.replaceAll("\t", " ").replaceAll("{Body copy}", "");
  }

  // DOM
  getInputValue(seletor) {
    return document.querySelector(seletor).value;
  }
  setUpListeners() {
    // SUBMIT INPUT VALUE
    document.querySelector(this.selector_submitButton).addEventListener("click", () => {
      const inputValue = this.getInputValue(this.selector_textAreaInput);
      this.start(inputValue);
    });
  }
  getOptionsValues() {
    const layout = document.querySelector(this.selector_selectLayout).value;
    const direction = document.querySelector(this.selector_selectDirection).value;
    const language = document.querySelector(this.selector_selectLanguage).value;
    const slideShow = document.querySelector(this.selector_selectSlideshow).value;
    const order = document.querySelector(this.selector_inputNumberOrder).value;
    return { layout, direction, language, slideShow, order };
  }
  setFinalMarkDown(finalValue) {
    document.querySelector(this.selector_textAreaResult).value = finalValue;
  }

  // HELPERS
  resetVariables() {
    this.arriveReferences = false;
  }
}
const generator = new JeckyllQuickGenerator();

// .(?<=([a-zA-z]|\)|\})(:|\.|[a-zA-z]|\?)[0-9])(,?[0-9]?){0,30}

// << text >>
// (<<).+(>>)

// (https|http)?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%,_\+.~#?&//=]*)
// /(<<).+(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))?(>>)/g
// /(<<).+(>>)/g
