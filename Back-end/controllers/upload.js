// const fs = require('fs');
// const path = require('path');
// const reports = require('../models/report');

// async function handleUploading(req, res) {
//     const { image, filename, childName, sessionId } = req.body;

//     if (!image || !filename || !childName || !sessionId) {
//         return res.status(400).json({ error: 'Missing required fields: image, filename, childName, or sessionId' });
//     }

//     // Define the directory structure
//     const imagesDirectory = path.join(__dirname, '..', 'photos');
//     const sessionDirectory = path.join(imagesDirectory, childName, sessionId);

//     // Create directories if they don’t exist
//     if (!fs.existsSync(sessionDirectory)) {
//         fs.mkdirSync(sessionDirectory, { recursive: true });
//     }

//     // Save the file
//     const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
//     const filePath = path.join(sessionDirectory, filename);
//     const relativePath = path.join('photos', childName, sessionId, filename);

//     try {
//         fs.writeFileSync(filePath, base64Data, 'base64');

//         if (filename.includes('img')) {
//             // Handle `img` file
//             const screenshotFilename = filename.replace('img', 'screenshot');
//             const screenshotPath = path.join(sessionDirectory, screenshotFilename);
//             const screenshotRelativePath = path.join('photos', childName, sessionId, screenshotFilename);

//             // Check if the corresponding screenshot exists
//             const existingScreenshot = fs.existsSync(screenshotPath) ? screenshotRelativePath : null;

//             await reports.findOneAndUpdate(
//                 { childname: childName, sessionid: sessionId },
//                 {
//                     $push: {
//                         images: {
//                             imgpath: relativePath,
//                             screenshotpath: existingScreenshot || null
//                         }
//                     }
//                 },
//                 { upsert: true, new: true }
//             );
//         } else if (filename.includes('screenshot')) {
//             // Handle `screenshot` file
//             const imgFilename = filename.replace('screenshot', 'img');
//             const imgPath = path.join(sessionDirectory, imgFilename);
//             const imgRelativePath = path.join('photos', childName, sessionId, imgFilename);

//             // Check if the corresponding image exists
//             const existingImage = fs.existsSync(imgPath) ? imgRelativePath : null;

//             if (existingImage) {
//                 // Update the existing `images` object with the screenshot
//                 await reports.findOneAndUpdate(
//                     {
//                         childname: childName,
//                         sessionid: sessionId,
//                         'images.imgpath': existingImage
//                     },
//                     {
//                         $set: {
//                             'images.$.screenshotpath': relativePath
//                         }
//                     },
//                     { new: true }
//                 );
//             } else {
//                 // Add a new entry if the image does not exist
//                 await reports.findOneAndUpdate(
//                     { childname: childName, sessionid: sessionId },
//                     {
//                         $push: {
//                             images: {
//                                 imgpath: null,
//                                 screenshotpath: relativePath
//                             }
//                         }
//                     },
//                     { upsert: true, new: true }
//                 );
//             }
//         }

//         res.json({ success: true, message: `File saved and database updated successfully` });
//     } catch (error) {
//         console.error("Error saving file or updating database:", error);
//         res.status(500).json({ error: 'Error saving file or updating database' });
//     }
// }

// module.exports = {
//     handleUploading
// };


const fs = require('fs');
const path = require('path');
const reports = require('../models/report');

async function handleUploading(req, res) {
    const { image, filename, childName, sessionId } = req.body;

    if (!image || !filename || !childName || !sessionId) {
        return res.status(400).json({ error: 'Missing required fields: image, filename, childName, or sessionId' });
    }

    // Define the directory structure
    const imagesDirectory = path.join(__dirname, '..', 'photos');
    const sessionDirectory = path.join(imagesDirectory, childName, sessionId);

    // Create directories if they don’t exist
    if (!fs.existsSync(sessionDirectory)) {
        fs.mkdirSync(sessionDirectory, { recursive: true });
    }

    // Save the file
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const filePath = path.join(sessionDirectory, filename);
    const relativePath = path.join('photos', childName, sessionId, filename);

    try {
        fs.writeFileSync(filePath, base64Data, 'base64');

        // If the file is an image (contains 'img' in its name)
        if (filename.includes('img')) {
            const imagePath = relativePath;

            // Check if the corresponding screenshot exists
            const screenshotFilename = filename.replace('img', 'screenshot');
            const screenshotPath = path.join(sessionDirectory, screenshotFilename);
            const screenshotRelativePath = path.join('photos', childName, sessionId, screenshotFilename);

            // Find the existing report for the child and session
            const report = await reports.findOne({
                childname: childName,
                sessionid: sessionId
            });

            if (report) {
                // If the report exists, check if the image already exists in the images array
                const existingImage = report.images.find(img => img.imgpath === imagePath);

                if (!existingImage) {
                    // Add the image to the database if it does not exist
                    await reports.updateOne(
                        { childname: childName, sessionid: sessionId },
                        {
                            $push: {
                                images: {
                                    imgpath: imagePath,
                                    screenshotpath: screenshotRelativePath // Initially set screenshotpath
                                }
                            }
                        }
                    );
                    console.log(`Image added: ${imagePath}`);
                }
            } else {
                // If no report exists, create a new one with the image
                await reports.create({
                    childname: childName,
                    sessionid: sessionId,
                    images: [
                        {
                            imgpath: imagePath,
                            screenshotpath: screenshotRelativePath // Initially set screenshotpath
                        }
                    ]
                });
                console.log(`New report created with image: ${imagePath}`);
            }

            // If the screenshot exists, update the database with the screenshot path
            if (fs.existsSync(screenshotPath)) {
                await reports.updateOne(
                    { childname: childName, sessionid: sessionId },
                    {
                        $set: {
                            'images.$[elem].screenshotpath': screenshotRelativePath
                        }
                    },
                    {
                        arrayFilters: [{ 'elem.imgpath': imagePath }],
                        new: true
                    }
                );
                console.log(`Screenshot added for ${imagePath}: ${screenshotRelativePath}`);
            }

        } else if (filename.includes('screenshot')) {
            // If a screenshot is uploaded first, do nothing and return
            console.log(`Screenshot uploaded first without corresponding image, not adding to database: ${filename}`);
            return res.json({ success: true, message: 'Screenshot uploaded first, not added to the database.' });
        }

        res.json({ success: true, message: 'File saved and database updated successfully' });
    } catch (error) {
        console.error("Error saving file or updating database:", error);
        res.status(500).json({ error: 'Error saving file or updating database' });
    }
}

module.exports = {
    handleUploading
};


