const mysql = require('./mysqlConnection');
const jwtmiddleware = require('./jwtmiddleware');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const expensedownload = async (req, res) => {
    try {
        const front_end_jwttoken = req.headers.authorization;

        const decodedjwttoken = jwtmiddleware.jwt_decode(front_end_jwttoken);

        const userid = decodedjwttoken.userId;

        if (decodedjwttoken.ispremium == '1') {
            const selectAllExpensesQuery = 'SELECT * FROM addexpense WHERE loginuserid = ?';

            mysql.connection.query(selectAllExpensesQuery, [userid], async (error, results) => {
                if (error) {
                    console.error('Error fetching expenses: ', error);
                    return res.status(500).json({ error: 'Error fetching expenses' });
                }

                const pdfDoc = await PDFDocument.create();
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const textSize = 12;
                const margin = 50;
                const lineHeight = textSize * 1.5;

                const pageWidth = 800;
                const pageHeight = 600; // You can adjust this as needed

                const expensesPerPage = Math.floor((pageHeight - 2 * margin) / lineHeight);

                let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                let y = currentPage.getHeight() - margin;
                let expenseCounter = 0;

                for (const expense of results) {
                    const expenseamount = expense.expenseamount;
                    const description = expense.description.replace(/[\r\n]/g, ' ');
                    const category = expense.category.replace(/[\r\n]/g, ' ');

                    const text = `Expense ${expenseCounter + 1}:\nAmount: ${expenseamount}\nDescription: ${description}\nCategory: ${category}`;

                    const lines = text.split('\n');
                    const textHeight = lines.length * lineHeight;

                    if (y - textHeight < margin) {
                        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                        y = currentPage.getHeight() - margin;
                    }

                    for (const line of lines) {
                        currentPage.drawText(line, {
                            x: margin,
                            y: y,
                            font: font,
                            size: textSize,
                            color: rgb(0, 0, 0),
                        });
                        y -= lineHeight;
                    }

                    expenseCounter++;
                    if (expenseCounter >= expensesPerPage) {
                        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
                        y = currentPage.getHeight() - margin;
                        expenseCounter = 0;
                    }
                }

                const pdfBytes = await pdfDoc.save();

                res.setHeader('Content-Disposition', 'attachment; filename=expenses.pdf');
                res.setHeader('Content-Type', 'application/pdf');

                res.end(pdfBytes);
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
};

module.exports = {
    expensedownload,
};
