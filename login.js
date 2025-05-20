// Script principal com animações GSAP e lógica de carregamento

// Função executada assim que o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Documento pronto! Iniciando animações...');
    
    // Referências de elementos
    const telaCarregamento = document.getElementById('telaCarregamento');
    const barraProgresso = document.querySelector('.preenchimento');
    const containerLogin = document.querySelector('.containerLogin');
    const cartaoLogin = document.querySelector('.cartaoLogin');
    const formularioLogin = document.getElementById('formularioLogin');
    
    // Iniciar a animação da tela de carregamento
    iniciarTelaCarregamento();
    
    // Configuração da animação das bolhas do fundo
    animarFundo();
    
    // Função que inicia a animação da tela de carregamento
    function iniciarTelaCarregamento() {
        console.log('Iniciando tela de carregamento...');
        
        // Timeline para a barra de progresso
        let tlCarregamento = gsap.timeline({
            onComplete: terminarCarregamento
        });
        
        // Animação da barra de progresso
        tlCarregamento.to(barraProgresso, {
            width: '100%',
            duration: 2.5,
            ease: 'power2.inOut'
        });
        
        // Adicionar pequenos pulsos na logo durante o carregamento
        gsap.to('.logoCarregamento', {
            scale: 1.05,
            duration: 0.8,
            repeat: -1,
            yoyo: true
        });
    }
    
    // Função executada ao terminar o carregamento
    function terminarCarregamento() {
        console.log('Carregamento completo, exibindo tela de login...');
        
        // Timeline para animação de saída da tela de carregamento
        let tlSaida = gsap.timeline({
            onComplete: mostrarLogin
        });
        
        // Animação de saída da tela de carregamento
        tlSaida.to(telaCarregamento, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut'
        });
    }
    
    // Função para mostrar a tela de login
    function mostrarLogin() {
        console.log('Mostrando formulário de login...');
        // Esconder completamente a tela de carregamento
        telaCarregamento.style.display = 'none';
        
        // Tornar o container de login visível para poder animar
        gsap.set(containerLogin, { opacity: 1 });
        
        // Timeline para a animação de entrada do login
        let tlLogin = gsap.timeline();
        
        // Animação de entrada do cartão de login
        tlLogin.from(cartaoLogin, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'elastic.out(1, 0.7)'
        });
        
        // Animação dos elementos do formulário
        tlLogin.from('.cabecalhoLogin', {
            opacity: 0,
            y: -20,
            duration: 0.7,
            ease: 'back.out(1.5)'
        }, "-=0.5");
        
        tlLogin.from('.campoFormulario', {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.2,
            ease: 'power2.out'
        }, "-=0.3");
        
        tlLogin.from(['.opcoes', '.botaoEntrar', '.rodapeLogin'], {
            opacity: 1,
            y: 20,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power2.out'
        }, "-=0.2");
        
        // Adicionar um brilho especial ao título
        gsap.to('.tituloLogin', {
            textShadow: "0 0 15px rgba(255, 215, 0, 0.7)",
            repeat: -1,
            yoyo: true,
            duration: 1.5
        });
    }
    
    // Função para animar o fundo com as bolhas
    function animarFundo() {
        console.log('Animando elementos do fundo...');
        
        // Reiniciar posições aleatórias para as bolhas
        document.querySelectorAll('.bolha').forEach(bolha => {
            const randomX = Math.random() * 100;
            const randomScale = 0.8 + Math.random() * 0.7;
            
            gsap.set(bolha, {
                x: `${randomX}vw`,
                scale: randomScale,
            });
            
            // Recriar a animação de subir para cada bolha para evitar sobreposição em seus ciclos
            gsap.to(bolha, {
                y: '-180vh',
                rotation: Math.random() * 720 - 360,
                duration: 15 + Math.random() * 15,
                repeat: -1,
                delay: Math.random() * 5,
                ease: 'none',
                opacity: () => {
                    return 0.3 + Math.random() * 0.4;
                }
            });
        });
    }
    
    // O manipulador de eventos para o formulário de login foi movido para o script inline em index.html
    // para integração com o backend PHP
});