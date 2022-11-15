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
  regularExpresionSup = /.(?<=([a-zA-z]|\d|\)|\})(:|.)[0-9])(,?[0-9]?){0,30}/g;

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
    const bodyCopyPrepared = this.prepareBodyCopy(introductionPrepared);
    const numbersWithSupPrepared = this.prepareSupNumbersReferences(bodyCopyPrepared);
    console.log(numbersWithSupPrepared);

    this.setFinalMarkDown(numbersWithSupPrepared.join("\n"));
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
        ---`;
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
  prepareBodyCopy(stringArr) {
    return stringArr.map((string) => {
      console.log(string.startsWith("Body copy"));
      if (string.startsWith("Body copy")) {
        const bodyCopy = string.replace("Body copy", "").trim();
        return bodyCopy;
      } else {
        return string;
      }
    });
  }
  prepareSupNumbersReferences(stringArr) {
    return stringArr.map((string) => {
      if (string.match(this.regularExpresionSup)) {
        const supNumber = string.replaceAll(this.regularExpresionSup, (x) => `<sup>${x}</sup>`).trim();
        return supNumber;
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
    return string.replaceAll("\t", " ");
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
}
const generator = new JeckyllQuickGenerator();

// ([a-zA-z]|:|\.)[0-9]
// .(?<=[a-zA-z](:|\.)[0-9])(,?[0-9]?){0,30}
