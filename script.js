class PokemonList {
  constructor(pokemonsList, quantity = 150) {
    this.quantity = quantity <= 420 && quantity !== 0 ? quantity : 150;
    this.pokemonsList = document.querySelector(pokemonsList);
    this.insertPokemonsInTheList = this.insertPokemonsInTheList.bind(this);
  }

  insertPokemonsInTheList(pokemons) {
      this.divsPokemon = pokemons.reduce((acc, { name, id, types }) => {
        const pokeName = `${name[0].toUpperCase()}${name.substring(1)}`;
        const pokeImage = `https://pokeres.bastionbot.org/images/pokemon/${id}.png`
        const pokeTypes = types.map(({ type: { name } }) => name);

        return acc += `
          <div class="pokemon ${pokeTypes[0]}">
            <h2>${id} - ${pokeName}</h2>
            <img src="${pokeImage}" alt="${pokeName}">
            <p>${pokeTypes.join(' | ')}</p>
          </div>
        `;
      }, '');
    
      this.pokemonsList.innerHTML = this.divsPokemon;
  }

  getPokemonApiUrl(id) {
    return `https://pokeapi.co/api/v2/pokemon/${id}/`;
  }

  fetchPokemon() {
    return Array(this.quantity).fill().map((_, index) =>
      fetch(this.getPokemonApiUrl(index + 1)).then(res => res.json()));
  }

  getPokemons() {
    const pokemonsPromises = this.fetchPokemon();
    
    Promise.all(pokemonsPromises)
      .then(this.insertPokemonsInTheList);
  }

  init() {
    if (this.quantity && this.pokemonsList) this.getPokemons();
    return this;
  }
}

class Pagination {
  constructor({ 
    dataQuantity, 
    perPage, 
    buttons: { first, prev, next, last },
    numbersContainer,
    list
  }) {
    let itemsPerPage = perPage > 0 && perPage <= 30 ? perPage : 10;
    this.states = {
      page: 1,
      perPage: itemsPerPage,
      totalPages: Math.ceil(dataQuantity / itemsPerPage),
      maxVisibleButtons: 5,
    };
    this.buttonsInterface = {
      first: document.querySelector(first),
      prev: document.querySelector(prev),
      next: document.querySelector(next),
      last: document.querySelector(last),
    };
    this.list = document.querySelector(list);
    this.numbersContainer = document.querySelector(numbersContainer);
    this.whenPopulateList = this.whenPopulateList.bind(this);
  }

  forButtons() {
    this.buttons = {
      create: (number) => {
        const div = document.createElement('div');
        div.innerText = number;
        
        if (number === this.states.page) div.classList.add('active');

        div.addEventListener('click', (e) => {
          this.controls.goTo(Number(e.target.innerText));
        })

        this.numbersContainer.appendChild(div);
      },
      update: () => {
        this.numbersContainer.innerHTML = '';

        let leftVisible = this.states.page - Math.floor(this.states.maxVisibleButtons / 2);
        let rightVisible = this.states.page + Math.floor(this.states.maxVisibleButtons / 2);

        if (leftVisible < 1) {
          leftVisible = 1;
          rightVisible = this.states.maxVisibleButtons;
        }

        if (rightVisible > this.states.totalPages) {
          rightVisible = this.states.totalPages;
          leftVisible = this.states.totalPages - this.states.maxVisibleButtons + 1;
        }

        for (let page = leftVisible; page <= rightVisible; page++) {
          this.buttons.create(page);
        }
      },
      addEvents: () => {
        this.buttonsInterface.first.addEventListener('click', () => {
          this.controls.goTo(1);
        });
        this.buttonsInterface.last.addEventListener('click', () => {
          this.controls.goTo(this.states.totalPages);
        });
        this.buttonsInterface.prev.addEventListener('click', () => {
          this.controls.prev();
        });    
        this.buttonsInterface.next.addEventListener('click', () => {
          this.controls.next();
        });
      },
    }
    this.buttons.addEvents();
    this.buttons.update();
  }

  forControls() {
    this.controls = {
      prev: () => {
        this.states.page--;
        if (this.states.page < 1) this.states.page = 1;
        this.update();
      },
      next: () => {
        this.states.page++;
        if (this.states.page > this.states.totalPages) this.states.page = this.states.totalPages;
        this.update();
      },
      goTo: (page) => {
        this.states.page = page;
        this.update();
      },
    }
  }

  generatePagination() {
    this.list.innerHTML = '';

    const start = this.states.page * this.states.perPage - this.states.perPage;
    const end = start + this.states.perPage;

    this.elementsToShow = this.elementsInList.slice(start, end);
    this.elementsToShow.forEach((elementToShow) => {
      this.list.appendChild(elementToShow);
    });
  }

  update() {
    this.buttons.update();
    this.generatePagination();
  }

  whenPopulateList() {
    this.observer.disconnect();
    this.elementsInList = [...this.list.children];
    this.update();
  }

  observeWhenListIsPopulated() {
    this.observer = new MutationObserver(this.whenPopulateList);
    this.observer.observe(this.list, { childList: true });
  }

  init() {
    if (this.states && this.buttonsInterface && this.list && this.numbersContainer) {
      this.observeWhenListIsPopulated();
      this.forControls();
      this.forButtons();
    }
    return this;
  }
}

const pokemonList = new PokemonList('.pokemons-list', 150);

const pokemonPagination = new Pagination({
  dataQuantity: pokemonList.quantity,
  perPage: 10,
  buttons: {
    first: '.first',
    prev: '.prev',
    next: '.next',
    last: '.last',
  },
  numbersContainer: '.numbers',
  list: '.pokemons-list',
});

pokemonList.init();
pokemonPagination.init();
