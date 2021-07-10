const { writeFile } = require('fs')
const PDFParser = require('pdf2json')

class PaserPdf {
    #formatter
    #pdfParser

    constructor(formatterObject) {
        this.#formatter = formatterObject
        this.#pdfParser = new PDFParser()
    }

    async parseDocument({ nameOutput, nameInput }) {
        const data = await this.#parsePDF(nameInput)
        this.#writeNewPage(data, nameOutput)
    }

    #parsePDF(nameInput) {
        return new Promise((resolve, reject) => {
            this.#pdfParser.on('pdfParser_dataError', (errData) => reject(errData.parserError))
            this.#pdfParser.on('pdfParser_dataReady', (pdfData) => {
                resolve(this.#formatter.formatPDF(pdfData))
            })
            this.#pdfParser.loadPDF(`./pdf/${nameInput}`)
        })
    }

    #writeNewPage(data, nameOutput) {
        writeFile(`./json/${nameOutput}.json`, JSON.stringify(data), (err) => {
            if (err) return console.log(err)
        })
    }
}

module.exports = PaserPdf
