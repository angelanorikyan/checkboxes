
/**
 * TagCheckBox
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getStorageFilter,
  getStorageDistribution,
} from 'containers/App/storage';
import StyledTagCheckBox from './StyledTagCheckBox';



class TagCheckBox extends Component {
  state = {
    result: [],
    globalIds: {},
  }

  componentDidMount() {
    const { tagFilter, tagQuantity } = this.props;
    const distVersion = getStorageDistribution();
    const storageTagFilterValue = getStorageFilter('tags', distVersion);
    // const defaultFilters = storageTagFilterValue ? storageTagFilterValue.split(',').map(Number) :  null ;

    let defaultFilters; 
    if(tagQuantity && tagQuantity.length){
      defaultFilters = tagQuantity
    }else {
      defaultFilters = [];
    }
    if(storageTagFilterValue && !tagQuantity){
      defaultFilters = storageTagFilterValue.split(',').map(Number)
    }

    const map = {};

    if(defaultFilters && defaultFilters.length) {
      defaultFilters.forEach(id => {
        map[id] = id
      })
      this.setState({
        globalIds: map,
      })
    }
    const parent = {};
    const child = {};
    if(tagFilter && tagFilter.values && tagFilter.values.length) {
      tagFilter.values.forEach(filter => {
        if (!parent[filter.category]) {
          parent[filter.category] = { ids: [filter.id], name: filter.category}
        } else {
          parent[filter.category] = {
            ...parent[filter.category],
            ids: [...parent[filter.category].ids, filter.id],
          }
        }
        if (!child[filter.subcategory]) {
          child[filter.subcategory] = {
            parent: filter.category,
            name: filter.subcategory,
            ids: [filter.id],
            data: [{ name: filter.name, ids: [filter.id ]}],
          }
        } else {
          child[filter.subcategory] = {
            parent: filter.category,
            name: filter.subcategory,
            ids: [...child[filter.subcategory].ids, filter.id],
            data: [
              ...child[filter.subcategory].data,
              { name: filter.name, ids: [filter.id] },
            ],
          }
        }
      })
      const result = [];
      Object.values(parent).forEach(par => {
        result.push({
          name: par.name,
          ids: par.ids,
          data: Object.values(child)
            .filter(elm => elm.parent === par.name)
            .map(elm => ({name: elm.name, data: elm.data, ids: elm.ids})),
        })
      })
      this.setState({
        result,
      })
    }
  }

  handleChange = (current, level) => {
    const { globalIds}  = this.state;
    const { onGetIds } = this.props;
    const map = globalIds;

    if((level === 'level1' || level === 'level2') && current.filter(id => id === map[id]).length !== current.length) {
      current.forEach(id => {
        map[id] = id
      })
    } else {
      current.forEach(id => {
        if(!map[id]) {
          map[id] = id
        } else map[id] = null
      })
    }

    this.setState({
      globalIds: map,
    })
    onGetIds(Object.values(map).filter(elm => elm !== null));
  }

  compareTwoArrays = (current) => {
    const { globalIds } = this.state;
    const compared = [];
    if(current && current.length) {
      current.forEach(cur => {
        if(globalIds[cur]) {
          compared.push(cur)
        }
      })
    }
    return compared.length === current.length
  }

  compareAllArrays = (all) => {
    const { globalIds } = this.state;
    const compared = [];
    if(all && all.length) {
      all.forEach(cur => {
        if(cur.id !== '-'){
          if(globalIds[cur.id]) {
            compared.push(cur.id)
          }
        }
      })
    }
    const result = compared.length !== (all && all.length ? all.length - 1 : null)
    return result
  }

  selectAll = (all, level) => {
    const { globalIds}  = this.state;
    const { onGetIds } = this.props;

    const map = globalIds;

    if(level === 'levelAll' && all.filter(a => a.id === map[a.id]).length + 1 !== all.length){
      all.forEach(elm => {
        if(elm.id !== '-'){
          map[elm.id] = elm.id
        }
      })
    }else {
      all.forEach(elm => {
        if(elm.id !== '-'){
          if(!map[elm.id]){
            map[elm.id] = elm.id
          }else  map[elm.id] = null
        }
      })
    }
    
    this.setState({
      globalIds: map,
    })
    onGetIds(Object.values(map).filter(elm => elm !== null));
    
  }


  CheckBoxContent  = () => {
    const { tagFilter } = this.props;
    const { globalIds, result } = this.state;
    const pureLength = tagFilter && tagFilter.values && tagFilter.values.length ?  tagFilter.values.length - 1 : null;
    return <section className='general-tag-wrapper'>
      <div className='tagFilter-title'>Investment niche</div>
      <div className='separator'></div>
      <div className='tagfilter-container'>
        {
          result.length ? result.map(elm => elm.name ?
            <div className='category'>
              <span className={`${elm.ids.filter(p => globalIds[p]).length && elm.ids.filter(p => globalIds[p]).length !== elm.ids.length ? 'grey' : ''}`}>
                <label className='tagContainer parent' >
                  <input 
                    type='checkbox'
                    name={elm.name}
                    onChange={() => this.handleChange(elm.ids, 'level1')}
                    checked={this.compareTwoArrays(elm.ids)}></input>
                  <span className={`checkmark ${elm.ids.filter(p => globalIds[p]).length && elm.ids.filter(p => globalIds[p]).length !== elm.ids.length ? 'grey' : ''}`} ></span>
                  {elm.name}
                </label>
              </span>
              {elm.data.map(subCat => <div>
                <div className='subcategory'>
                  <label className='tagContainer mid' >
                    <input 
                      type='checkbox'
                      name={subCat.name}
                      onChange={() => this.handleChange(subCat.ids, 'level2')}
                      checked={this.compareTwoArrays(subCat.ids)}></input>
                    <span className={`checkmark ${subCat.ids.filter(p => globalIds[p]).length && subCat.ids.filter(p => globalIds[p]).length !== subCat.ids.length ? 'grey' : ''}`}></span>
                    {subCat.name}
                  </label>
                  {subCat.data.map(tag => <div>
                    <div className='tag'>
                      <label className='tagContainer child' >
                        <input 
                          type='checkbox'
                          name={tag.name}
                          onChange={() => this.handleChange(tag.ids, 'level3')}
                          checked={this.compareTwoArrays(tag.ids)}></input>
                        <span className='checkmark'></span>
                        {tag.name}
                      </label>
                    </div>
                  </div>)}
                </div>
              </div>)}
            </div>
            : null)
            : null
        }
      </div>
      <label className='tagContainer' htmlFor='checkbox'>
        <input 
          id='checkbox'
          type='checkbox'
          onChange={() => this.selectAll(tagFilter.values, 'levelAll')}
          checked={this.compareAllArrays(tagFilter && tagFilter.values && tagFilter.values.length ? tagFilter.values : null)}></input>
        <span className='checkmarkNotick'></span>
        {!Object.values(globalIds).length 
        || Object.values(globalIds).includes(null) 
        || pureLength!==Object.values(globalIds).length ? 
          'Select All' : 'Unselect All'}
      </label>
    </section>
  }


  render() {
    const content = this.CheckBoxContent();
    return (
      <StyledTagCheckBox>
        {content}
      </StyledTagCheckBox>
    );
  }
}

TagCheckBox.propTypes = {
  tagFilter: PropTypes.array,
  onGetIds: PropTypes.func,
  tagQuantity:PropTypes.number,
};

export default TagCheckBox