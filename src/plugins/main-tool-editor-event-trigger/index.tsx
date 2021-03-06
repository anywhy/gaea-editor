import { Select, Tooltip } from 'antd';
import { Connect } from 'dob-react';
import * as _ from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Icon from '../../components/icon/src';
import * as Styled from './index.style';
import { Props, State } from './index.type';

const triggerOptions = [
  {
    key: 'init',
    value: 'Init'
  }
];

@Connect
class MainToolEditorEventTrigger extends React.Component<Props, State> {
  public static defaultProps = new Props();
  public state = new State();

  /**
   * 组件实例的信息
   */
  private instanceInfo: InstanceInfo;

  /**
   * 设置
   */
  private setting: IGaeaSetting;

  /**
   * callback 的配置列表
   */
  private indexMapCallbackEvent = new Map<number, ISettingEvent>();

  /**
   * 当前事件数据
   */
  private currentEventInfo: InstanceInfoEvent = null;

  public render() {
    // 当前编辑组件的 key
    const instanceKey = this.props.stores.ViewportStore.currentEditInstanceKey;

    if (!this.props.stores.ViewportStore.instances.has(instanceKey)) {
      return null;
    }

    this.instanceInfo = this.props.stores.ViewportStore.instances.get(instanceKey);

    // 当前事件数据
    if (!this.instanceInfo.data.events) {
      return null;
    }

    this.currentEventInfo = this.instanceInfo.data.events[this.props.index];

    if (!this.currentEventInfo) {
      return null;
    }

    this.setting = this.props.actions.ApplicationAction.getSettingByInstance(this.instanceInfo);

    const mergedTriggerOptions = triggerOptions.concat(
      (this.setting.events || []).map((event, index) => {
        this.indexMapCallbackEvent.set(index + triggerOptions.length, event);
        return {
          key: 'callback',
          value: event.text
        };
      })
    );
    const MergedTriggerOptions = mergedTriggerOptions.map((each, index) => {
      return (
        <Select.Option key={index} value={each.key}>
          {each.value}
        </Select.Option>
      );
    });

    return (
      <Styled.Container>
        <Styled.HeaderContainer>
          <Styled.Label>{this.props.stores.ApplicationStore.setLocale('触发', 'Trigger')}</Styled.Label>
          <Select value={this.currentEventInfo.trigger as string} onChange={this.handleChange as any}>
            {MergedTriggerOptions}
          </Select>
        </Styled.HeaderContainer>

        <Styled.BodyContainer>{this.renderTriggerBody()}</Styled.BodyContainer>
      </Styled.Container>
    );
  }

  private handleChange = (value: InstanceInfoEventTrigger, index: number) => {
    if (value === 'callback') {
      const event = this.indexMapCallbackEvent.get(index);

      this.props.actions.ViewportAction.instanceSetEvent(
        this.props.stores.ViewportStore.currentEditInstanceKey,
        this.props.index,
        {
          ...this.currentEventInfo,
          trigger: value,
          triggerData: _.cloneDeep(event),
          actionData: {
            data: _.cloneDeep(event.data)
          }
        }
      );
      return;
    }

    this.props.actions.ViewportAction.instanceSetEvent(
      this.props.stores.ViewportStore.currentEditInstanceKey,
      this.props.index,
      {
        ...this.currentEventInfo,
        triggerData: {},
        actionData: {},
        trigger: value
      }
    );
  };

  private renderTriggerBody = () => {
    const triggerData = this.instanceInfo.data.events[this.props.index].triggerData;

    if (!triggerData || !triggerData.data) {
      return null;
    }

    return triggerData.data.map((param, index) => {
      return (
        <Styled.CallbackItem key={index}>
          <span>Provider</span>
          <Styled.ParamLabel>{param.name}</Styled.ParamLabel>
        </Styled.CallbackItem>
      );
    });
  };
}

export default {
  position: 'mainToolEditorEventTrigger',
  class: MainToolEditorEventTrigger
};
