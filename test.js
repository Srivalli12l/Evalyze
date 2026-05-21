fetch('http://localhost:3000/api/resume/analyze', { method: 'POST' }).then(res => res.text().then(text => console.log('Status:', res.status, 'Body:', text.substring(0, 500))))
