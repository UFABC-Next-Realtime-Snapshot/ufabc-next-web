import Stats from '@/services/Stats'
import Histories from '@/services/Histories'
import ErrorMessage from '@/helpers/ErrorMessage'
import PrettySeason from '@/helpers/PrettySeason'
import findSeasonKey from '@/helpers/FindSeason'
import SubjectModel from '@/models/SubjectModel'
import Axios from 'axios'


import _ from 'lodash'

export default {
  name: 'Subjects',
  data(){
    return {
      season: findSeasonKey(),
      usage: null,
      subjects:[],
    }
  },
  computed: {
    prettySeason() {
      return PrettySeason(this.season)
    },
  },

  async created() {
    this.fetchAll();
  },

  methods: {
    getSubject(){
      const URL = "http://localhost:3000/subjects"
      Axios
      .get(URL)
      .then( res => {
        this.subjects = res.data;
        console.log(res.data);
      })
    },
    allSeasons() {
      let firstSeason = '2019:1'
      let finalSeason = findSeasonKey()

      let currentSeason = firstSeason
      let seasons = [{
        text: PrettySeason(currentSeason),
        value: currentSeason
      }]
      while(currentSeason != finalSeason) {
        let year = currentSeason.split(':')[0]
        let quad = currentSeason.split(':')[1]
        if(quad == 3) {
          quad = 1
          year++
        } else {
          quad++
        }
        currentSeason = year + ':' + quad
        seasons.push({
          text: PrettySeason(currentSeason),
          value: currentSeason
        })
      }

      return seasons
    },

    async changeTargetSeason() {
      let dialog = this.$dialog({
        title: 'Alterar quadrimestre',
        width: '750px',
        top: '10vh',
        inputType: 'select', 
        items: this.allSeasons(),
        inputPlaceholder: 'Escolha o quadrimestre',
        validationRules: 'required',
      })

      try {
        let res = await dialog
        if(res) {
          this.season = res
          this.fetchAll()
        }

      } catch(e) {} 
    },



    fetchAll() {
      this.fetch()
      this.fetchOverview()
      this.fetchUsage()
    },
    
  
    async fetchOverview() {
      let body = {
        season: this.season
      }
      if(this.filterByPeriod && this.filterByPeriod.length == 1){
        body.turno = this.filterByPeriod[0]
      }

      try {
        let res = await Stats.matricula('overview', body)
        if(res.data && res.data.data && res.data.data.length) {
          this.overview = res.data.data[0]
        }
      } catch(err) {

      }
    },

    async fetchUsage() {
      let body = {
        season: this.season
      }

      try {
        let res = await Stats.matriculaUsage(body)

        if(res.data) {
          this.usage = res.data
        }
      } catch(err) {

      }
    },

    async fetch(more) {
      if(more) {
        this.loading = false
        this.page = this.page + 1
        this.moreLoading = true
      } else {
        this.loading = true
        this.page = 0
        this.more = true
        this.moreLoading = true
      }

      let body = { 
        page: this.page, 
        [this.orderby]: 1,
        season: this.season,
      }
      if(this.filterByPeriod && this.filterByPeriod.length == 1){
        body.turno = this.filterByPeriod[0]
      }

      try {
        let res = await Stats.matricula(this.tab, body)

        this.loading = false
        this.moreLoading = false

        if (more && this.disciplinas) {
          // Append data
          this.disciplinas = this.disciplinas.concat(res.data.data)

        } else {
          // Replace data
          this.disciplinas = res.data.data
        }

        // Check data is less than limit
        if (res.data.data.length < this.limit) {
          this.more = false
        }
        this.total = res.data.total
      } catch(err) {
        this.loading = false
        this.moreLoading = false

        this.page = this.page - 1

        this.$message({
          type: 'error',
          message: ErrorMessage(err),
        }) 
      }
    },

  },
  mounted(){
    this.getSubject();
  }
}






