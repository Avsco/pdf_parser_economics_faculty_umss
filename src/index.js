const FormatterEcoPDF = require('./class/formater.class')
const PaserPDF = require('./class/parser.class')
const { readdir } = require('fs')

const formatter = new FormatterEcoPDF()
const parser = new PaserPDF(formatter)

readdir('./pdf', (_, files) => {
    files.forEach((file) => {
        const newFile = file.replace('.pdf', '').replace(/\s/g, '')
        // fs.unlinkSync(`./json/${newFile}.json`)
        parser.parseDocument({ nameInput: file, nameOutput: newFile })
    })
})
//TODO: crear y verificar que existan las capertas json y pdf
