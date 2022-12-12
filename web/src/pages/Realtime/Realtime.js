import Stats from '@/services/Stats'
import ErrorMessage from '@/helpers/ErrorMessage'
import PrettySeason from '@/helpers/PrettySeason'
import findSeasonKey from '@/helpers/FindSeason'
import Axios from 'axios'


import _ from 'lodash'


export default {

  name: 'Subjects',
  data(){
    return {
      season: findSeasonKey(),
      usage: null,
      subjects:[],
      isRed:false,
      isYellow:false,
      isGreen:false,
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

 

  _methods: { 
    async getSubject() {
      const URL = "http://localhost:7711/students/student/11224/disciplines"
      const cpAluno = 0.8;
      
    
      await Axios
        .get(URL)
        .then(res => {
          this.subjects = res.data;
          this.contAmarelo=true;
          res.data.forEach(element => {
            try{if(element.thresholdCp < cpAluno){
              this.isGreen = !this.isGreen;
            }else if(element.thresholdCp == cpAluno){
              this.isYellow = !this.isYellow;
            }else{
              this.isRed= !this.isRed;
              this.changeText();
            }}
          catch(err){

          }
          
          
        });
        }
        )
        
    },
   changeText(){
      document.querySelector("#dynamicId").disabled=true;
     
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
      if (this.filterByPeriod && this.filterByPeriod.length == 1) {
        body.turno = this.filterByPeriod[0]
      }

      try {
        let res = await Stats.matricula('overview', body)
        if (res.data && res.data.data && res.data.data.length) {
          this.overview = res.data.data[0]
        }
      } catch (err) {
      }
    },

    async fetchUsage() {
      let body = {
        season: this.season
      }

      try {
        let res = await Stats.matriculaUsage(body)

        if (res.data) {
          this.usage = res.data
        }
      } catch (err) {
      }
    },

    async fetch(more) {
      if (more) {
        this.loading = false
        this.page = this.page + 1
        this.moreLoading = true
        this.contAmarelo = true;
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
      if (this.filterByPeriod && this.filterByPeriod.length == 1) {
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
      } catch (err) {
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

  get methods() {
    return this._methods
  },
  set methods(value) {
    this._methods = value
  },
  mounted(){
    this.getSubject();
    this.changeText();
    
  }
}






