const { Client, Location, List, Buttons, LocalAuth} = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require('fs');
const {PythonShell} = require('python-shell')

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});

setInterval(() => {
    fs.readFile('month', function(err, data) {
        const date = new Date();
        const today = date.getDate();
        if (err) throw err;
        // console.log(data.toString());
        if(data.toString() !== today.toString()){
            fs.writeFile('month', today.toString(), function (err) {
                if (err) throw err;
                // console.log('Saved!');
            });
            fs.writeFile('listaTestes.txt', '', function (err) {
                if (err) throw err;
                // console.log('Saved!');
            });
        }
    });
}, 10000);

// setInterval(() => {
//     const filenames = fs.readdirSync('/var/www/html/_temp_/')
//     filenames.forEach(filename => {
//         fs.readFile(`/var/www/html/_temp_/${filename}`, function (err, data) {
//             // console.log(data.toString());
//             // console.log(filename);

//             fs.unlink(`/var/www/html/_temp_/${filename}`, function (err) {
//                 if (err) throw err;
//             })
//             createLogin(filename, data.toString());
//         });             
//     });
// }, 10000);

let optionsTests = {
    mode: 'text',
    pythonPath: '/usr/bin/python3',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: 'pyy/'
    //args: ['value1', 'value2', 'value3']
  };

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--unhandled-rejections=strict"
                    ] }
});

// const client = new Client({
//     authStrategy: new LocalAuth()
// });

// const client = new Client();

const name = "Joka";

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

client.on("message_create", async (msg) => {
    const filenames = fs.readdirSync('canceled/')
    filenames.forEach(filename => {
        if (filename === msg.body) {
            // console.log('file exists');
            fs.unlink(`canceled/${filename}`, function (err) {
                if (err) throw err;
            })
            client.sendMessage(filename, `Você saiu da conversa com o atendente. ❌  

Caso precise de mais alguma coisa, envie uma mensagem no chat e procure no menu, *(já sou cliente)*, e falar com atendente novamente...`);
        }
    });
});

client.on('message', async msg => {
    let chat = await msg.getChat();
    // console.log(chat.id);
    // console.log(chat.isGroup);
    if(chat.isGroup) return;

    // console.log(msg.body);
    // console.log(msg.from);

    const filenames = fs.readdirSync('canceled/')
    filenames.forEach(filename => {
        if (filename === msg.body) {
            // console.log('file exists');
            fs.unlink(`canceled/${filename}`, function (err) {
                if (err) throw err;
            })
            client.sendMessage(msg.from, `Você saiu da conversa com o atendente. ❌  

Caso precise de mais alguma coisa, envie uma mensagem no chat e procure no menu, *(já sou cliente)*, e falar com atendente novamente...`);
        }
    });

    if (fs.existsSync(`canceled/${msg.from}`)) {
        // console.log('file exists');
        if (msg.body.toLowerCase() === 'sair') {
            fs.unlink(`canceled/${msg.from}`, function (err) {
                if (err) throw err;
                // console.log('File deleted!');
                });
            client.sendMessage(msg.from, `Você saiu da conversa com o atendente. ❌  

Caso precise de mais alguma coisa, envie uma mensagem no chat e procure no menu, *(já sou cliente)*, e falar com atendente novamente...`);
        } else {
            return
        }    
    }

    


    if (msg.body === 'start') {
        let button = new Buttons(`Olá 🙋🏻‍♂️
        
        A StarNet Agradece seu contato. Como podemos ajudar?
        
        Fique a vontade para tirar suas dúvidas!`,[{body:'🥳 Já sou cliente 🥳'},{body:'⭐️ Sou novo(a) aqui ⭐️'}], "Bem-vindo(a) a StarNet ⭐️",'Agradecemos a preferência!');
        client.sendMessage(msg.from, button);
    } else if (msg.body === 'Efetuar compra') {
        let button = new Buttons(`Olá! 👋\n\n🔥 Escolha seu plano agora mesmo e receba seu acesso imediatamente após o pagamento!`,[{body:'💰 Comprar acesso 💰'}], "StarNet 5G",'Agradecemos a preferência!');
        client.sendMessage(msg.from, button);
    
    }else if(msg.body === "💰 Comprar acesso 💰"){
        let optionsmp = {
            mode: 'text',
            pythonPath: '/usr/bin/python3',
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: 'pyy/',
            args: [msg.from, 20.00, 1]
          };

        PythonShell.run('mp.py', optionsmp, function (err, results) {
            if (err) throw err;
            client.sendMessage(msg.from, `*📌 DETALHES DA COMPRA*

*🛍️ PRODUTO*: LOGIN VPN
*💰 PREÇO:* R$20,00
*📅 VÁLIDADE:* 30 Dias
*👤 LIMITE:* 1

🔰 Faça o pagamento usando o PIX Copia e Cola:`);
            client.sendMessage(msg.from, results[0]);
          });


    } else if (msg.body === '🕖 Teste nosso serviço 🕖') {
          
        fs.readFile("./listaTestes.txt", function (err, data) {
            if (err) throw err;
            if(data.toString().includes(msg.from)){
                client.sendMessage(msg.from, '❌ Você já possui um teste ativo, você poderá criar um novo teste em breve.\n\nCaso você não consiga conectar retorne ao menu anterior e escolha a opção Já sou cliente e depois a opção falar com um atendente.');
            } else {
                client.sendMessage(msg.from, '⭐️ Agradecemos a preferência!\n\nSeu teste está sendo criado, espere alguns minutos!');
                PythonShell.run('teste.py', optionsTests, function (err, results) {
                    if (err) throw err;
                    client.sendMessage(msg.from, `⌛ Teste criado com sucesso: 
 
🌍 Servidor StarNet ⭐ 
 
======Dados de acesso====== 
 
🔑 ${results[1]}
🔒 ${results[2]} 
📅 VÁLIDADE: 01:00 hora 
👤 LIMITE: 1 
 
                      *Tutorial de uso* 
 
1 - Abra o app que você instalou e selecione a operadora. 
 
2 - Digite o usuário e a senha. 
 
3 - ligue o dados móveis e desligue Wi-fi. 
 
4 - clique em Conectar. 
 
5 - Deve aparecer Conectado. 🚀 
 
🔥 Baixe o APP e faça o login com os dados acima: 
 
https://play.google.com/store/apps/details?id=starnet5g.miracle`);
                  });
                
                
                writeListFile(msg.from);
            }
        });

        // Sou cliente
    } else if (msg.body === '⭐️ Já sou cliente / Revendedor ⭐️') {
        let button = new Buttons(`Olá, Bem vindos ao menu do Cliente 🌟

*Renovação e mais informações*❓

clique em falar com atendente que responderemos em alguns minutos.

=×=×=×=×=×=×=×=×=×=×=×=×=

✅ *Links úteis*

*Painel Web* ⤵️ obs: apenas para revendedores

 https://painelstarnet.com.br/

📱 *Aplicativo StarNet5G* ⤵️

 https://play.google.com/store/apps/details?id=starnet5g.miracle

_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_—

Escolha uma das opções abaixo`,[{body:'💰 Comprar acesso 💰'}, {body: "🚀 Qual o meu login? 🚀"}, {body: "👤 Falar com um atendente 👤"}, {body: "📱 Baixar aplicativo 📱"}], null,'Agradecemos a preferência!');
        client.sendMessage(msg.from, button);

    } else if (msg.body === '📱 Baixar aplicativo 📱') {
        client.sendMessage(msg.from, '📱 Baixe o APP na loja:');

    } else if (msg.body === '👤 Falar com um atendente 👤') {
        let button = new Buttons(`Perfeito 🧑🏻‍💻💬

Você entrou no modo de atendimento, responderemos em alguns minutos, para sair do modo de atendimento clique no botão abaixo ou envie a palavra "SAIR"!`,[{body: msg.from}], null,'Agradecemos a preferência!');
        client.sendMessage(msg.from, button);

        fs.appendFile(`canceled/${msg.from}`, '', function (err) {
            if (err) throw err;
            // console.log('Saved!');
          });
    } else if (msg.body === '🚀 Qual o meu login? 🚀') {
        fs.readFile(`listaContas/${msg.from}`, function (err, data) {
            if (err){
                client.sendMessage(msg.from, '❌ você não possui nenhuma conta ativa no momento. 😔\n\nBasta você voltar ao menu anterior e adquirir um acesso. 😉');
                return;
            }
            let line = data.toString()
            // console.log(line)

            if(!line) {
                client.sendMessage(msg.from, '❌ você não possui nenhuma conta ativa no momento. 😔\n\nBasta você voltar ao menu anterior e adquirir um acesso. 😉');
            } else {
                client.sendMessage(msg.from, "🔥 Agradecemos a preferência!\n\nSeu login está sendo recuperado, espere um minuto!");
                setTimeout(() => {
                    let senha = line.split("::::")[1];
                    let login = line.split("::::")[0];
                    client.sendMessage(msg.from, "🔥 " + login + "\n\n🔥 " + senha);
                }, 5000);
            }
        });
        // Não sou cliente
    } else if (msg.body === '🙋🏻‍♂️ Sou Novo(a) aqui 🙋🏻‍♀️️') {
        let button = new Buttons(`A melhor Internet 4G 100% ilimitada do Brasil 🇧🇷\n\nEscolha uma das opções abaixo.`,[{body:'⭐ Saiba mais sobre o plano ⭐'}, {body: "💰 Comprar acesso 💰"}, {body: '🕖 Teste nosso serviço 🕖'}], null,'Agradecemos a preferência!'); 
        client.sendMessage(msg.from, button);

    } else if (msg.body === '⭐ Saiba mais sobre o plano ⭐') {
        client.sendMessage(msg.from, `🌎 StarNet 5G
        
        🚨 AGORA TER INTERNET 100% ILIMITADA NO SEU SMARTPHONE FICOU FÁCIL E BARATO!!!
               
        ✅ É BEM SIMPLES E RÁPIDO, EU IREI TE ENVIAR O APLICATIVO DA INTERNET PARA VOCÊ INSTALAR NO SEU SMARTPHONE, LOGO DEPOIS VOU TE PASSAR UM LOGIN PARA VOCÊ SE CONECTAR NO NOSSO APLICATIVO, LOGO APÓS É SÓ USUFRUIR DA INTERNET 100% ILIMITADA👏🏼
               
        ✅ NÃO PRECISA TER DADOS MÓVEIS
        SÓ PRECISA TER UM CHIP ATIVO COM SINAL 4G DAS OPERADORAS
           
          *(VIVO)*
          *(TIM)*
          *(OI)*
          *(CLARO)*
               
        ✅ PLANO MENSAL (ANDROID)
        POR APENAS R$:20,00
              
         🚨 RECOMENDAÇÕES
         NÃO A NESSECIDADE DE EFETUAR RECARGAS MENSALMENTE.                        
       
       APENAS RECOMENDAMOS VOCÊ EFETUAR UMA RECARGA MÍNIMA DE 3 EM 3 MESES PARA SEU CHIP NÃO FICAR INATIVO E VC PERDER SEU NÚMER0`)
       
    } else if (msg.body === '🔑 Seja revendedor 🔑') {
  
        let button = new Buttons(`📱PAINEL DE REVENDA NET ILIMITADA 🇧🇷

Painel: https://painelstarnet.com.br/

⏱️ Para fazer o teste em nosso aplicativo retorne ao menu inicial e clique em *“sou novo aqui”*, lá você poderá gerar um teste.

📌 Depois do teste caso se interesse em revender, entre em contato com o atendente.

*Fique a vontade para tirar suas dúvidas!*`, [{body: "💰 Tabela de preços - Revenda"}, {body: "💬 Perguntas frequentes - Revenda"}, {body: "👤 Falar com um atendente 👤"}], "Bem-vindo(a) ao Painel StarNet ⭐",'Agradecemos a preferência!');
        client.sendMessage(msg.from, button);

    } else if (msg.body === '💰 Tabela de preços - Revenda') {
        client.sendMessage(msg.from, `📱PAINEL DE REVENDA NET ILIMITADA 🇧🇷 
        SOMOS REFERÊNCIA EM SERVIÇOS VPN's. CONFIABILIDADE E SERIEDADE.
  
➡️ Painel: https://painelstarnet.com.br

    ≠≠≠≠≠≠≠≠≠ MENSALISTA ≠≠≠≠≠≠≠≠≠ 
         
    ✅ - 05 Logins = R$ 25,00 *+Brinde*
         
    ✅ - 10 Logins = R$ 45,00 *+Brinde*
         
    ✅ - 20 Logins = R$ 55,00 *+Brinde*
         
    ✅ - 30 Logins = R$ 65,00 *+Brinde*
         
    ✅ - 40 Logins = R$ 75,00 *+Brinde*
         
    ✅ - 50 Logins = R$ 80,00 *+Brinde*

    ≠≠≠≠≠≠≠≠≠ CRÉDITOS ≠≠≠≠≠≠≠≠≠ 
         
        VALIDADE DE 1 MÊS PARA PODER UTILIZAR OS CRÉDITOS, SERÁ ACUMULATIVO CASO FAÇA UMA RECARGA MÍNIMA. ELES ACUMULARÃO JUNTO COM OS NOVOS CRÉDITOS ADICIONADOS`)

    } else if (msg.body === '💬 Perguntas frequentes - Revenda') {

         client.sendMessage(msg.from, `💬 PERGUNTAS FREQUENTES 💬  
  
        - Consigo adicionar e excluir usuários?  
          
        Você terá acesso a um painel moderno e simples na qual você gerência os logins. Você irá conseguir: adicionar, alterar, apagar, editar e monitorar os usuários online.  
          
        - Posso vender a quanto?  
          
        Você pode vender no valor que você quiser.  
          
        - Quanto tempo dura os créditos no painel?  
          
        Os créditos adquiridos tem duração de 30 dias e precisam ser consumidos dentro desse prazo. caso renove os créditos serão acumulativos. Cada crédito equivale a 1 conexão (login) e 30 dias.  
        [: 📲 RODANDO TUDO  
 
×=×=×=×=×=×=×=×=×=×=×=××=×= 
✅(Operadoras) 
🟣 VIVO (CDN INCLUSA+SEGURO) 
🔴 Claro (CDN INCLUSA+SEGURO) 
🔵 Tim  (CDN INCLUSA+SEGURO) 
🟡 Oi  (CDN INCLUSA+SEGURO) 
×=×=×=×=×=×=×=×=×=×=×=××=×=    
  
        🕹ᴊᴏɢᴏs ᴏɴʟɪɴᴇ  
        🍿ɴᴇᴛғʟɪx  
        📼ʏᴏᴜᴛᴜʙᴇ 720p a 4K  
        📺ɪᴘᴛᴠ ғᴜʟʟ ʜᴅ  
        👪ʀᴇᴅᴇ sᴏᴄɪᴀɪs  
        📈ᴛʀᴀғᴇɢᴏ ɪʟɪᴍɪᴛᴀᴅᴏ  
        🔞xᴠɪᴅᴇᴏs  
        📥ᴅᴏᴡɴʟᴏᴀᴅ ɪʟɪᴍɪᴛᴀᴅᴏ  
        📞ʟɪɢᴀçᴏᴇs Whatsapp  
        🗣ᴇ ᴍᴜɪᴛᴏ ᴍᴀɪs  
          
        ✅ - Grupo de Suporte 24H 
        ✅ - Internet Rápida  
        ✅ - Ping baixo para Games`)

    } else {
        let button = new Buttons(`Olá 🙋🏻‍♂️
        
        A StarNet Agradece seu contato. Como podemos ajudar?

🆔 Comprar acesso VPN - Compre seu acesso para 30 dias.

🆓 Criar teste Grátis - Você só pode criar 1 teste a cada 24 horas.

📳 Suporte ao Cliente - Entre em contato conosco!

✅ Download Aplicativo - Baixar nosso Aplicativo da Play Store.

🔑 Revenda - Seja um revendedor e comece a ter uma renda extra
        
    💬 Envie qualquer mensagem para voltar ao menu inicial e Fique a vontade para tirar suas dúvidas!`,[{body:'⭐️ Já sou cliente / Revendedor ⭐️'},{body:'🙋🏻‍♂️ Sou Novo(a) aqui 🙋🏻‍♀️️'}, {body: '🔑 Seja revendedor 🔑'}], "Bem-vindo(a) a StarNet ⭐️",'Agradecemos a preferência!');
        client.sendMessage(msg.from, button);
    }

});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

function checkListFile(number) {
    fs.readFile("./listaTestes.txt", function (err, data) {
        if (err) throw err;
        if(data.toString().includes(number)){
            return true;
        } else {
            return false;
        }
      });
}

function writeListFile(number) {
    fs.appendFile('listaTestes.txt', number, function (err) {
        if (err) throw err;

      });
}

function checkAccountfile(number) {
    let lineAccount;
    fs.readFile("./listaContas.txt", async function (err, data) {
        if (err) throw err;
        let line = data.toString().split("\n");
        lineAccount = line.filter((item) => {
            return item.includes(number);
        });
    });
    console
    return lineAccount
}


function createLogin(number, quant) {
    let optionsacc = {
        mode: 'text',
        pythonPath: '/usr/bin/python3',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: 'pyy/',
        args: [quant]
        };
    client.sendMessage(number, "Pagamento Aprovado ✅\n\n⏳ Aguarde alguns minutos, estamos criando sua conta...");
    PythonShell.run('conta.py', optionsacc, function (err, results) {
        if (err) throw err;
        // console.log(results[1] + "\n" + results[2]);
        if (fs.existsSync(`listaContas/${number}`)) {
            fs.unlink(`listaContas/${number}`);
        }
        fs.appendFile(`listaContas/${number}`, `${results[1]}::::${results[2]}`, function (err) {
                if (err) throw err;
       });

        client.sendMessage(number, `📲 Login comprado com sucesso ✅ 
 
🌍 Servidor StarNet ⭐
 
======Dados de acesso====== 
 
🔑 ${results[1]} 
🔒 ${results[2]}
📅 VÁLIDADE: 30 Dias 
👤 LIMITE: 1 
 
                      *Tutorial de uso* 
 
1 - Abra o app que você instalou e selecione a operadora. 
 
2 - Digite o usuário e a senha. 
 
3 - ligue o dados móveis e desligue Wi-fi. 
 
4 - clique em Conectar. 
 
5 - Deve aparecer Conectado. 🚀 
 
💥 Obrigado por usar nossos serviços! 
 
🔥 Baixe o APP e faça o login com os dados acima: 
 
https://play.google.com/store/apps/details?id=starnet5g.miracle`);
    });
}

// function writeAccountFile(number, login, senha) {
//     fs.appendFile('listaContas.txt', number + " - " + login + ":" + senha, function (err) {
//         if (err) throw err;
//       });
// }

