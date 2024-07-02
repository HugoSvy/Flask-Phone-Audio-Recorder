// script.js
document.addEventListener("DOMContentLoaded", () => {
    const setupDiv = document.getElementById('setup');
    const nameInput = document.getElementById('name');
    const colorInput = document.getElementById('color');
    const startSetupButton = document.getElementById('startSetup');

    const startStopButton = document.getElementById('startStopButton');
    const welcomeMessage = document.getElementById('welcomeMessage');
    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];
    let userName = '';

    if (setupDiv) {
        startSetupButton.addEventListener('click', () => {
            userName = nameInput.value;
            const userColor = colorInput.value;
            if (userName) {
                sessionStorage.setItem('userName', userName);
                sessionStorage.setItem('userColor', userColor);
                window.location.href = 'recorder.html';
            } else {
                alert('Veuillez entrer votre prénom.');
            }
        });
    }

    if (startStopButton) {
        userName = sessionStorage.getItem('userName');
        const userColor = sessionStorage.getItem('userColor');
        document.body.style.backgroundColor = userColor;
        document.documentElement.style.backgroundColor = userColor;  // Ajouter cette ligne
        welcomeMessage.textContent = `Bonjour, ${userName}!`;

        startStopButton.addEventListener('click', async () => {
            if (isRecording) {
                mediaRecorder.stop();
            } else {
                if (!mediaRecorder) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder = new MediaRecorder(stream);
                        mediaRecorder.ondataavailable = event => {
                            audioChunks.push(event.data);
                        };
                        mediaRecorder.onstop = () => {
                            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                            audioChunks = [];
                            sendRecording(audioBlob);
                        };
                    } catch (err) {
                        alert('L\'accès au microphone est nécessaire pour enregistrer.');
                        return;
                    }
                }
                mediaRecorder.start();
            }
            isRecording = !isRecording;
            startStopButton.textContent = isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement';
            startStopButton.classList.toggle('recording', isRecording);
        });
    }

    const sendRecording = async (audioBlob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, `${userName}.wav`);
        formData.append('name', userName);
        formData.append('color', document.body.style.backgroundColor);

        try {
            const response = await fetch('https://your-web-service.com/upload', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                alert('Enregistrement envoyé avec succès.');
            } else {
                alert('Erreur lors de l\'envoi de l\'enregistrement.');
            }
        } catch (error) {
            alert('Erreur lors de l\'envoi de l\'enregistrement.');
        }
    };
});
