
const METER_URL = "";
const LOGO_URL = "";

let widget = await createWidget();

if (!config.runsInWidget) {
	await widget.presentSmall();
}

Script.setWidget(widget);
Script.complete();

async function getMeter(method) {
	const req = new Request(METER_URL + method);
	return await req.loadJSON();
}

async function getImage(image) {
	let fm = FileManager.local();
	let dir = fm.documentsDirectory();
	let path = fm.joinPath(dir, image);
	if (fm.fileExists(path)) {
		return fm.readImage(path);
	} else {
		let imageUrl;
		switch (image) {
			case 'logo.png':
				imageUrl = LOGO_URL;
				break;
			default:
				console.log(`Sorry, couldn't find ${image}.`);
		}
		let iconImage = await loadImage(imageUrl);
		fm.writeImage(path, iconImage);
		return iconImage;
	}
}

async function loadImage(imgUrl) {
	const req = new Request(imgUrl)
	return await req.loadImage()
}

async function addLabel(labelStack, label) {
	const mytext = labelStack.addText(label);
	mytext.font = Font.boldMonospacedSystemFont(12);
	mytext.textColor = Color.black();
}

async function addData(stack, data) {
    const mytext = stack.addText(data);
    mytext.font = Font.boldMonospacedSystemFont(12);
    mytext.textColor = Color.white();
}

async function createWidget() {

	const logoImg = await getImage('logo.png');
	const last = await getMeter('last');
	const today = await getMeter('today');

	let w = new ListWidget()
	w.backgroundColor = new Color("#03a9f4", 1.0);
	let nextRefresh = Date.now() + 1000 * 10;
	w.refreshAfterDate = new Date(nextRefresh)

	let headerStack = w.addStack();

	const titleStack = headerStack.addStack();
	titleStack.setPadding(8, 0, 0, 0);

	headerStack.addSpacer(5);
	const logoStack = headerStack.addStack();
	logoStack.size = new Size(30, 30);

	const title1Label = titleStack.addText("Solar Meter");
	title1Label.font = Font.heavyMonospacedSystemFont(15);
	title1Label.textColor = Color.black();

	logoStack.backgroundColor = new Color("#03a9f4", 1.0)
	const wimgLogo = logoStack.addImage(logoImg)
	wimgLogo.imageSize = new Size(30, 30);
	wimgLogo.rightAlignImage()

	const bodyStack = w.addStack();

	const labelStack = bodyStack.addStack();
	labelStack.setPadding(10, 0, 10, 0);
	labelStack.borderWidth = 0;
	labelStack.layoutVertically();

	addLabel(labelStack, "  Active:");
	addLabel(labelStack, "   Meter:");
	addLabel(labelStack, "    Temp:");
	addLabel(labelStack, "     Total:");
	addLabel(labelStack, "       Sun:");
	addLabel(labelStack, "   Faults:");

	const dataStack = bodyStack.addStack();
    dataStack.setPadding(10, 3, 10, 0);
    dataStack.borderWidth = 0;
    dataStack.layoutVertically();

	addData(dataStack, last.active.toString() + " W");
	addData(dataStack, last.meter.toString() + " W");
	addData(dataStack, last.temp.toString() + " °C");
	addData(dataStack, today.consumption.toString() + " kWh");
	addData(dataStack, today.consumed.toString() + " kWh");
	addData(dataStack, today.faults.toString());

	return w;
	
}
