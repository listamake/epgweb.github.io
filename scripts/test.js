<!DOCTYPE html>
<html>
<head>
  <title>Extrair informações do EPG de IPTV</title>
  <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet">

  <style>
    body {
      font-family: Arial, sans-serif;
    }

    /* Estilo para as classificações indicativas */
    .rating-square {
      display: inline-block;
      width: 24px;
      height: 24px;
      text-align: center;
      line-height: 24px;
      border: 1px solid #000;
      color: #fff;
      font-size: 14px;
      font-weight: normal;
      font-family: "Anton", sans-serif;
      margin-right: 5px;
    }

    .rating-l { background-color: green; }
    .rating-a10 { background-color: #00ced1; } /* Azul Celeste */
    .rating-a12 { background-color: #ffd700; } /* Amarelo Ouro */
    .rating-a14 { background-color: orange; }
    .rating-a16 { background-color: red; }
    .rating-a18 { background-color: black; }

  /* Tamanho da fonte para o nome do canal/IDs */
  .program-info-container strong {
    font-size: 14px;
  }

  /* Tamanho da fonte para o nome do programa */
  .program-name {
    font-size: 18px;
    font-weight: bold;
  }

  /* Tamanho da fonte para as informações de início, fim e duração dos programas */
  .program-info-container span {
   font-size: 16px;
  }

  /* Estilo para a imagem do programa */
  .program-image {
     
	 width:150%;
     max-width: 110px; /* Limitar a largura máxima da imagem */
     height: 75px; /* Ajustar a altura automaticamente de acordo com a largura */
     object-fit: cover;
     margin-right: 10px;
     float: left;
     border-radius: 10px; /* Adicionando bordas arredondadas */
     margin-bottom: 18px; /* Adicionando uma margem inferior */
 }

  /* Estilo para as informações do programa */
  .program-info {
     display: block;
     vertical-align: top;
     margin-top: 10px; /* Adicionar uma margem superior */
     flex: 1;
     margin: 0 10px; /* Adicionar margem aos lados para separar os elementos */
    }
   .program-info-container {
     display: flex;
     align-items: center;
     margin-bottom: 5px;
   }
 
 /* Estilo para a lista */
   #epgList {
     list-style: none;
     padding: 0;
	 margin: 0; /* Remover a margem padrão da lista */
  }

 #epgList li {
     display: flex;
     justify-content: space-between;
	 flex-direction: column;
	 align-items: stretch;
     margin-bottom: 10px; /* Adicionar espaço de 5 pixels entre os itens */
     background-color: #f0f0f0; /* Cor cinza claro */
     border-radius: 15px; /* Cantos arredondados */
     padding: 10px; /* Espaçamento interno para afastar o conteúdo das bordas */
  }

  /* Estilo para o contêiner da barra de duração e tempo restante */
  .duration-info {
     display: block;
     margin-top: 5px;
  }

  /* Estilo para a barra de duração */
  .duration-bar {
     display: block;
     height: 6px;
     background-color: #ccc;
     margin-top: 5px;
  }

  .duration-progress {
     height: 100%;
     background-color: #00ced1; /* Azul Celeste */
  }

  /* Estilo para o tempo restante */
  .time-remaining {
     font-size: 14px;
     display: flex;
  }

    .rating-info {
      display: flex;
      align-items: center;
    }
	
	/* Estilo para a lista em telas pequenas */
@media screen and (max-width: 480px) {
  #epgList li {
    flex-direction: column; /* Alterar para direção de linha em telas pequenas */
    align-items: stretch; /* Centralizar os elementos horizontalmente */
  }

  .program-info {
    flex: 1;
    margin: 0 10px; /* Adicionar margem aos lados para separar os elementos */
  }

  .duration-info {
    margin-top: 10px; /* Aumentar a margem superior para separar os itens */
  }

  .program-image {
    /* Reduzir a largura máxima da imagem em telas pequenas */
    margin-right: 10px;
    margin-bottom: 0; /* Remover a margem inferior da imagem */
  }

  .time-remaining {
    margin-left: auto; /* Alinhar o tempo restante à direita */
  }

  .program-info-container strong {
    font-size: 10px; /* Reduzir o tamanho da fonte para o nome do canal/IDs */
  }

  .program-name {
    font-size: 14px; /* Reduzir o tamanho da fonte para o nome do programa */
  }

  .program-info-container span {
    font-size: 14px; /* Reduzir o tamanho da fonte para as informações de início, fim e duração dos programas */
  }
  }
  
   </style>
</head>
<body>
  <ul id="epgList"></ul>

  <script>
    const epgUrl = "https://raw.githubusercontent.com/listamake/iptvbr/main/guide/epg.xml";
    const programIconDefault = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi68rQV6RY07KgoH3-ULq29CqmN0fKvMBLIb6M-w5AMOjRiqNqDsaajVzxmdK_xNRYJXu0jv_nmfco36yWoFyPPiIqXyT-w_IXCHo-1x0VwcCc015nxI0bm2gf1Jd-Tyh7zCKCGkvuXQsyynNPh6Y2ogNl_hZ1mcTqhEVVV32mO1lFXL1cye50qMcO3l6U/s320/GD_imgSemImagem.png";



    // Variáveis para cache
    let cachedEPGXml = null;
    let cachedIcons = {};

    // Função para extrair informações do EPG
    function extractEPGInfo() {
      if (cachedEPGXml) {
        parseEPG(cachedEPGXml, cachedIcons);
      } else {
        fetch(epgUrl)
          .then(response => response.text())
          .then(xmlString => {
            cachedEPGXml = xmlString;
            parseEPG(xmlString, cachedIcons);
          })
          .catch(error => {
            console.error("Erro ao obter o EPG:", error);
          });
      }
    }

    // Função para fazer o download de uma imagem e retornar seu conteúdo em base64
    function downloadImageBase64(url) {
      return fetch(url)
        .then(response => response.blob())
        .then(blob => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ url, base64: reader.result });
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        });
    }


    // Função para calcular o tempo restante do programa
    function calculateTimeRemaining(programEnd) {
      const now = new Date();
      return (programEnd - now) / 1000; // em segundos
    }

    // Função para mapear a data e hora no formato "YYYYMMDDHHMMSS TZ"
    function mapDateTime(dateTimeString) {
      const regex = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s([+-])(\d{2})(\d{2})$/;
      const match = dateTimeString.match(regex);
      if (match) {
        const [, year, month, day, hour, minutes, seconds, sign, offsetHours, offsetMinutes] = match;
        const timezoneOffset = (sign === "+" ? 1 : -1) * (parseInt(offsetHours, 10) * 60 + parseInt(offsetMinutes, 10));
        return new Date(Date.UTC(year, month - 1, day, hour, minutes, seconds) - timezoneOffset * 60 * 1000);
      }
      return null;
    }

    // Função para adicionar zeros à esquerda
    function padZero(number) {
      return number.toString().padStart(2, '0');
    }

    // Função para formatar a hora e os minutos no formato "HH:MM"
    function formatTime(date) {
      const hours = padZero(date.getHours());
      const minutes = padZero(date.getMinutes());
      return `${hours}:${minutes}`;
    }

    // Função para formatar a duração em dias, horas e minutos
    function formatDuration(duration) {
      const days = Math.floor(duration / 86400); // 86400 segundos em um dia
      const remainingSeconds = duration % 86400;
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      let formattedDuration = '';
      if (days > 0) {
        formattedDuration += `${days} dia${days > 1 ? 's' : ''} `;
      }
      if (hours > 0) {
        formattedDuration += `${hours} hora${hours > 1 ? 's' : ''} `;
      }
      if (minutes > 0) {
        formattedDuration += `${minutes} minuto${minutes > 1 ? 's' : ''}`;
      }
      return formattedDuration.trim();
    }

    // Função para mapear o número da classificação indicativa
    function mapRating(rating) {
      const ratingMap = {
        "L": { text: "L", color: "green" },
        "10": { text: "10", color: "#00ced1" }, // Azul Celeste
        "12": { text: "12", color: "#ffd700" }, // Amarelo Ouro
        "14": { text: "14", color: "orange" },
        "16": { text: "16", color: "red" },
        "18": { text: "18", color: "black" },
		"Classificação não disponível": { text: "!", color: "white" },
		
        // Classificações com variantes
        "AL": { text: "AL", color: "green" },
        "A10": { text: "A10", color: "#00ced1" }, // Azul Celeste
        "A12": { text: "A12", color: "#ffd700" }, // Amarelo Ouro
        "A14": { text: "A14", color: "orange" },
        "A16": { text: "A16", color: "red" },
        "A18": { text: "A18", color: "black" },
		// Classificações do TVPG
		"TVY": { text: "Y", color: "black" },
		"TVY7": { text: "Y7", color: "black" },
		"TVG": { text: "G", color: "black" },
		"TVPG": { text: "PG", color: "black" },
		"TV14": { text: "14", color: "black" },
		"TVMA": { text: "MA", color: "black" }
      };

      return ratingMap[rating] || null;
    }

    // Função para mapear o valor da classificação indicativa a partir do elemento <value>
    function mapRatingValue(ratingElement) {
      const valueElement = ratingElement.querySelector("value");
      return valueElement ? valueElement.textContent : null;
    }

    // Função para mapear a classificação indicativa a partir do elemento <rating system="CLASSIFICACAO_ETARIA"> e <rating system="CLASSIND">
    function mapProgramRating(programElement) {
      const programRatingElement = programElement.querySelector("rating[system='TVPG']");
      const programRatingIndElement = programElement.querySelector("rating[system='CLASSIND']");
      const programRating = programRatingElement ? mapRatingValue(programRatingElement) : programRatingIndElement ? mapRatingValue(programRatingIndElement) : null;
      return programRating;
    }
	// Função para mapear a descrição do programa a partir do elemento <desc="..."/>
	function mapChannelDescription(programElement) {
  const descElements = programElement.querySelectorAll("desc");
  
  for (const descElement of descElements) {
    const langAttribute = descElement.getAttribute("lang");
    if (!langAttribute || langAttribute.toLowerCase() === "pt") {
      return descElement.textContent;
    }
  }
  
  return null; // Retorna null se não encontrar descrição em português
}
    // Função para calcular a largura da barra de duração
    function calculateDurationProgress(programStart, programEnd) {
      const now = new Date();
      const totalTime = programEnd - programStart;
      const elapsedTime = now - programStart;
      return `${(elapsedTime / totalTime) * 100}%`;
    }

    // Função para mapear o nome do canal a partir do elemento <display-name lang="pt">
    function mapChannelName(channelElement) {
      const displayNameElement = channelElement.querySelector("display-name[lang='pt']");
      return displayNameElement ? displayNameElement.textContent : null;
    }
	
	
    // Função para mapear a capa do programa a partir do elemento <icon src="..."/>
    function mapProgramIcon(programElement) {
      const iconElement = programElement.querySelector("icon[src]");
      return iconElement ? iconElement.getAttribute("src") : null;
    }


    // Função para analisar o XML do EPG e extrair as informações desejadas
    function parseEPG(xmlString, cachedIcons) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const programElements = xmlDoc.getElementsByTagName("programme");
      const epgList = document.getElementById("epgList");
	  
      // Limpar a lista antes de preencher os dados
      epgList.innerHTML = '';
  // Verifique se a função filterProgramsByChannel está definida
  let filteredPrograms;
  if (typeof filterProgramsByChannel === 'function') {
    // Se a função estiver definida, use-a para filtrar os programas
    const programElements = xmlDoc.getElementsByTagName("programme");
    filteredPrograms = filterProgramsByChannel(programElements);
  } else {
    // Se a função não estiver definida, use todos os programas
    filteredPrograms = xmlDoc.getElementsByTagName("programme");
  }

  // Continue com o restante do código, agora utilizando os programas (filtrados ou não)
  for (const programElement of filteredPrograms) {
	  for (const programElement of filteredPrograms) {
    const listItem = personalizarItem(
      programElement,
      channelName,
      channelId,
      programName,
      programIcon,
      programRating,
      ratingInfo,
      subTitle,
      programStart,
      programEnd,
      formattedDuration,
      durationProgress,
      timeRemaining
    );

    epgList.appendChild(listItem);
  }
}  
        const channelId = programElement.getAttribute("channel");
        const channelElement = xmlDoc.querySelector(`channel[id="${channelId}"]`);
        if (!channelElement) {
          continue;
        }
		
		
        const channelName = mapChannelName(channelElement); // Mapear o nome do canal
        const programName = programElement.querySelector("title").textContent;
	    const programDesc = mapChannelDescription(programElement); // Mapear a capa do programa
        const programStart = mapDateTime(programElement.getAttribute("start"));
        const programEnd = mapDateTime(programElement.getAttribute("stop"));
        const programRating = mapProgramRating(programElement);
        const ratingInfo = mapRating(programRating);
        const programIcon = mapProgramIcon(programElement); // Mapear a capa do programa
  // Verificar se sub-title e category existem antes de tentar acessá-los
    const subTitleElement = programElement.querySelector("sub-title");
    const subTitle = subTitleElement ? subTitleElement.textContent : null;

    const categoryElements = programElement.querySelectorAll("category");
    const categories = categoryElements.length > 0
      ? Array.from(categoryElements).map(category => category.textContent)
      : [];
	  
	  
        if (!programStart || !programEnd) {
          continue;
        }

        // Filtrar programas atuais ou ao vivo
        const now = new Date();
        if (programStart <= now && programEnd >= now) {
          const programDuration = (programEnd - programStart) / 1000; // em segundos
          const timeRemaining = calculateTimeRemaining(programEnd);
          const formattedDuration = formatDuration(programDuration);
          const durationProgress = calculateDurationProgress(programStart, programEnd);

  

          // Criar um novo item na lista para cada programa
          const listItem = document.createElement("li");
		        listItem.classList.add("program-info-container"); // Adicionar a classe ao item da lista
                listItem.dataset.programEnd = programEnd; // Armazenar o horário de término como atributo personalizado
            
      listItem.innerHTML = `
            <div class="program-info-container">
              <img src="${programIcon || programIconDefault}" alt="Capa do programa" class="program-image">
              <div class="program-info">
                <strong>${channelName ? `${channelName} (${channelId})` : channelId}</strong><br>
                <span class="rating-info">
                  ${programRating ? `<span class="rating-square rating-${programRating.toLowerCase()}" style="background-color: ${ratingInfo.color};">${ratingInfo.text}</span>` : ''}
                 <span class="program-name"> ${programName}</span>
                </span>
				 ${subTitle ? `<span class="program-subtitle">${subTitle}</span><br>` : ''}<br>
                <span>${formatTime(programStart)} - ${formatTime(programEnd)} (${formattedDuration})</span>
              </div>
            </div>
            <div class="duration-info">
         <div class="duration-bar">
           <div class="duration-progress" style="width: ${durationProgress}"></div>
         </div>
        <span class="time-remaining">${timeRemaining > 0 ? formatDuration(timeRemaining) : 'Programa encerrado'}</span>
        </div>
          `;
          epgList.appendChild(listItem);
        }
      }
    }

    // Chamar a função para extrair informações do EPG inicialmente
    extractEPGInfo();

    // Definir intervalo de atualização (a cada 10 segundos)
    setInterval(extractEPGInfo, 40000);
  </script>
</body>
</html>
