import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(express.static('public'))

app.use(session({
    secret: 'segredo',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 }
}))

app.get('/', (req, res) => {
    res.redirect('/login')
})


let livros = []
let leitores = []

const usuarioo = 'BibliotecaBerta'
const senhaa = '17061993'


function pagina(conteudo){
    return `
    <html>
    <head>
        <title> Biblioteca da Berta </title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="/style.css">
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
        </head>
    <body>
        ${conteudo}
    </body>
    </html>
    `
}


function verificarLogin(req, res, next){
    if(!req.session.usuario){
        return res.redirect('/login')
    }
    next()
}


app.get('/login', (req, res) => {
    res.send(pagina(`
        <h2>Login</h2>
        <form method="POST" action="/login">
            <label for="usuario">Usuário:</label> 
            <input type="text" name="usuario" placeholder="Digite seu Usuário"><br>
            <label for="senha">Senha:</label> 
            <input type="password" name="senha" placeholder="Digite sua Senha"><br>
            <button>Entrar</button>
        </form>
    `))
})

app.post('/login', (req, res) => {
    const { usuario, senha } = req.body

    if(usuario === usuarioo && senha === senhaa){
        req.session.usuario = usuario
        res.cookie('ultimoAcesso', new Date().toLocaleString())
        return res.redirect('/menu')
    }

    res.send(pagina(`<p>Login inválido</p><a href="/login">Voltar</a>`))
})


app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})


app.get('/menu', verificarLogin, (req, res) => {

    const ultimo = req.cookies.ultimoAcesso || 'Primeiro acesso'

    res.send(pagina(`
        
        <h2>Menu</h2>
        <p>Último acesso em : ${ultimo}</p>

        <a href="/livros">Cadastro de Livros</a><br><br>
        <a href="/leitores">Cadastro de Leitores</a><br><br>
        <a href="/logout">Sair</a>
    `))
})

app.get('/livros', verificarLogin, (req, res) => {

    let lista = ''

    livros.forEach(l => {
        lista += `<li>${l.titulo} - ${l.autor} - ${l.isbn}</li>`
    })

    res.send(pagina(`
        
        <h2>Cadastro de Livros</h2>

        <form method="POST" action="/livros">
            <label for="titulo">Titulo do Livro:</label> 
            <input type="text" name="titulo" placeholder="Título"><br>
            <label for="autor">Autor do Livro:</label> 
            <input type="text" name="autor" placeholder="Autor"><br>
            <label for="isbn">Código do Livro:</label> 
            <input type="text" name="isbn" placeholder="Codigo do Livro ou ISBN"><br>
            <button>Cadastrar</button>
        </form>

        <h3>Lista</h3>
        <ul>
            ${lista}
        </ul>

        <a href="/menu">Voltar</a>
    `))
})

app.post('/livros', verificarLogin, (req, res) => {

    const { titulo, autor, isbn } = req.body

    if(!titulo || !autor || !isbn){
        return res.send(pagina(`<p>Preencha todos os campos</p><a href="/livros">Voltar</a>`))
    }

    livros.push({ titulo, autor, isbn })

    res.redirect('/livros')
})


app.get('/leitores', verificarLogin, (req, res) => {

    let opcoes = ''
    livros.forEach(l => {
        opcoes += `<option value="${l.titulo}">${l.titulo}</option>`
    })

    let lista = ''
    leitores.forEach(r => {
        lista += `<li>${r.nome} - ${r.livro}</li>`
    })

    res.send(pagina(`
        <h2>Cadastro de Leitores</h2>

        <form method="POST" action="/leitores">

            <label for="nome">Nome completo:</label>    
            <input type="text" name="nome" placeholder="Nome"><br>
            <label for="cpf">CPF:</label>   
            <input type="number" name="cpf" placeholder="CPF"><br>
            <label for="telefone">Telefone de Contato:</label>
            <input type="tel" name="telefone" placeholder="Telefone"><br>

            <label for="dataEmprestimo">Data de Emprestimo:</label>
            <input type="date" name="dataEmprestimo"><br>
            <label for="dataDevolucao">Data de Devolução:</label>
            <input type="date" name="dataDevolucao"><br>

            <select name="livro">
                <option value="">Selecione o seu Livro: </option>
                ${opcoes}
            </select><br><br>

            <button>Cadastrar</button>
        </form>

        <h3>Leitores Cadastrados</h3>
        <ul>
            ${lista}
        </ul>

        <a href="/menu">Voltar</a>
    `))
})

app.post('/leitores', verificarLogin, (req, res) => {

    const { nome, cpf, telefone, dataEmprestimo, dataDevolucao, livro } = req.body

    if(!nome || !cpf || !telefone || !dataEmprestimo || !dataDevolucao || !livro){
        return res.send(pagina(`<p>Preencha todos os campos</p><a href="/leitores">Voltar</a>`))
    }

    leitores.push({
        nome,
        cpf,
        telefone,
        dataEmprestimo,
        dataDevolucao,
        livro
    })

    res.redirect('/leitores')
})

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000 ')
})

export default app