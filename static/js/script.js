document.addEventListener('DOMContentLoaded', () => {
    const scannerContainer = document.getElementById('scanner-container');
    const resultContainer = document.getElementById('result-container');
    const qrReaderStatus = document.getElementById('qr-reader-status');
    const rescanButton = document.getElementById('rescan-button');

    const html5QrCode = new Html5Qrcode("qr-reader");

    const startScanner = () => {
        scannerContainer.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        qrReaderStatus.textContent = 'Requesting camera access...';

        const qrCodeSuccessCallback = (decodedText) => {
            console.log(`Scan result: ${decodedText}`);
            html5QrCode.stop().then(() => {
                console.log("QR Code scanning stopped.");
                processQRData(decodedText);
            }).catch(err => {
                console.error("Failed to stop QR Code scanning.", err);
                processQRData(decodedText);
            });
        };

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
            .then(() => {
                qrReaderStatus.textContent = 'Point camera at a LifeTag QR Code';
            })
            .catch(err => {
                console.error(`Unable to start scanning, error: ${err}`);
                qrReaderStatus.textContent = 'Error: Could not access camera. Please grant permission and refresh.';
                qrReaderStatus.style.color = 'red';
            });
    };

    const processQRData = (qrText) => {
        try {
            const jsonString = qrText.replace(/'/g, '"');
            const data = JSON.parse(jsonString);

            if (data && data.public) {
                displayPublicResults(data.public);
                if (data.private) {
                    fetchPrivateData(data.private);
                }
            } else {
                throw new Error("QR code missing required fields.");
            }

        } catch (error) {
            console.error("Error parsing QR data:", error);
            alert(`Invalid LifeTag QR.\n\nError: ${error.message}`);
            startScanner();
        }
    };

    const displayPublicResults = (data) => {
        document.getElementById('full_name').textContent = data.full_name || 'N/A';
        document.getElementById('address').textContent = data.address || 'N/A';
        document.getElementById('emergency_contact_name').textContent = data.emergency_contact_name || 'N/A';
        document.getElementById('emergency_contact_relation').textContent = data.emergency_contact_relation || 'N/A';
        document.getElementById('emergency_contact_address').textContent = data.emergency_contact_address || 'N/A';

        const callButton = document.getElementById('call-button');
        if (data.emergency_contact_mobile) {
            callButton.href = `tel:${data.emergency_contact_mobile}`;
            callButton.style.display = 'inline-flex';
        } else {
            callButton.style.display = 'none';
        }

        scannerContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
    };

    const fetchPrivateData = (encryptedPrivate) => {
        fetch('/decrypt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encrypted_private: encryptedPrivate })
        })
        .then(res => res.json())
        .then(result => {
            if (result.private) {
                displayPrivateResults(result.private);
            } else {
                console.error("Error decrypting private data:", result.error);
            }
        })
        .catch(err => {
            console.error("Fetch error:", err);
        });
    };

    const displayPrivateResults = (data) => {
        document.getElementById('blood_group').textContent = data.blood_group || 'N/A';
        document.getElementById('allergies').textContent = data.allergies || 'N/A';
        document.getElementById('chronic_conditions').textContent = data.chronic_conditions || 'N/A';
        document.getElementById('disabilities').textContent = data.disabilities || 'N/A';
        document.getElementById('emergency_note').textContent = data.emergency_note || 'N/A';
        document.getElementById('last_medical_update').textContent = data.last_medical_update || 'N/A';

        document.getElementById('private-info').style.display = 'block';
    };

    rescanButton.addEventListener('click', () => {
        startScanner();
    });

    startScanner();
});
