/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import DraggableList from 'react-draggable-list';
import { GoGrabber } from 'react-icons/go';
import { Input, Collapse, Button, Spin } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import reactToWebComponent from 'react-to-webcomponent';
import 'antd/dist/reset.css';
import './styles.css';
import ReactDOM from 'react-dom/client';
import Guidance from './guidance';
import { BiCollapseVertical } from 'react-icons/bi';
import { FaCheckCircle } from 'react-icons/fa';
import { cn } from '@heroui/react';
import { t } from 'i18next';

// Definir tipos
interface ListItem {
    id: string;
    index: number;
    text: string;
    guidande: string;
}

interface ItemProps {
    item: ListItem;
    dragHandleProps: any;
    commonProps: {
        onTextChange: (id: string, text: string) => void;
        onGuidandeChange: (id: string, guidande: string) => void;
        onDeleteItem: (id: string) => void;
        onAddItem: (id: string) => void;
        onCollapseChange: (id: string) => void;
        onNextItem: (id: string) => void;
        activeItemId: string | null;
        readonly: boolean;
    };
}

class Item extends React.Component<ItemProps> {
    render() {
        const { item, dragHandleProps, commonProps } = this.props;
        const handleClickIndex = (e: React.MouseEvent) => {
            e.stopPropagation();
            e.stopPropagation(); commonProps.onDeleteItem(item.id);
        };

        return (
            <div id={item.id} className="disable-select" style={{ display: 'flex' }} contentEditable={false}>
                <Collapse
                    ghost
                    expandIconPosition="end"
                    expandIcon={({ isActive }) => (
                        <RightOutlined
                            style={{
                                paddingTop: '50%',
                                transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                            }}
                        />
                    )}
                    // Disables accordion behavior, to reenable, uncomment below line
                    activeKey={commonProps.activeItemId === item.id ? [item.id] : []}
                    onChange={() => commonProps.onCollapseChange(item.id)}
                    items={[
                        {
                            key: item.id,
                            label: (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className="item-index" onClick={handleClickIndex}>{item.index + 1}</span>
                                    <Input
                                        readOnly={commonProps.readonly}
                                        placeholder={`${t("what's the")} ${item.index === 0 ? t('first') : t('next')} ${t("step")}?`}
                                        value={item.text}
                                        onClick={e => {
                                            console.log('commonProps.readonly', commonProps.readonly);
                                            if (!commonProps.readonly) e.stopPropagation();
                                        }}
                                        onChange={e => commonProps.onTextChange(item.id, e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                commonProps.onAddItem(item.id);
                                            }
                                            if (e.key === 'Backspace' && item.text === '') {
                                                commonProps.onDeleteItem(item.id);
                                            }
                                        }}
                                        onPaste={e => {
                                            e.stopPropagation();
                                        }}
                                        className={cn({
                                            'cursor-text': !commonProps.readonly,
                                            'cursor-pointer': commonProps.readonly,
                                        })}
                                    />
                                </div>
                            ),
                            children: (
                                <>
                                    <Guidance
                                        saveData={commonProps.onGuidandeChange}
                                        value={item.guidande}
                                        id={item.id}
                                        readonly={commonProps.readonly}
                                    />
                                    <Button
                                        className="collapse-next-button"
                                        onClick={() => commonProps.onNextItem(item.id)}
                                    >
                                        Next
                                    </Button>
                                </>
                            ),
                        },
                    ]}
                />
                {!commonProps.readonly && (
                    <div className="drag-handle" {...dragHandleProps}>
                        <GoGrabber />
                    </div>
                )}
            </div>
        );
    }
}

// eslint-disable-next-line react-refresh/only-export-components
const GuidedCheckListWC = ({ title, items, readonly }: { title?: string; items?: string; readonly?: boolean }) => {
    const [internalTitle, setInternalTitle] = useState(title || '');
    const [list, setList] = useState<ListItem[]>([]);
    const componentRef = useRef<HTMLElement>();
    const initialized = useRef(false);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [checkedItems, setCheckedItems] = useState<boolean[]>([]);

    useEffect(() => {
        const checkedItemsCopy = JSON.parse(JSON.stringify(checkedItems));

        while (checkedItemsCopy.length < list.length) {
            checkedItemsCopy.push(false);
        }
        setCheckedItems(checkedItemsCopy);
    }, [list]);

    // this force update the component when the items prop changes and fix a bug that randomly ignores que initial values on load page
    useEffect(() => {
        const loadData = () => {
            try {
                const initialTitle = title || '';
                const initialItems = items ? JSON.parse(items) : [createNewItem()];

                setInternalTitle(initialTitle === 'untitled'? '' : initialTitle);
                setList(
                    initialItems.map((item: ListItem, index: number) => ({
                        ...item,
                        id: item.id || crypto.randomUUID(),
                        index,
                    })),
                );
            } catch (e) {
                setList([createNewItem()]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [items, title]);

    // update z-index
    useEffect(() => {
        if (list.length === 0) return;
        const baseZIndex = 1000;
        const items = document.querySelectorAll('.guided-checklist > div > div > div');
        items.forEach((item, index) => {
            (item as HTMLElement).style.zIndex = (baseZIndex - index).toString();
        });
    }, [list, list.length]);

    useEffect(() => {
        if (!initialized.current) {
            try {
                //load initial values
                const initialTitle = title || '';
                const initialItems = items ? JSON.parse(items) : [createNewItem()];

                setInternalTitle(initialTitle);

                const stabilizedItems = initialItems.map((item: ListItem, index: number) => ({
                    ...item,
                    id: item.id || crypto.randomUUID(),
                    index,
                }));

                setList(stabilizedItems);
            } catch (e) {
                setList([createNewItem()]);
            }
            initialized.current = true;
        }
    }, []);

    // update component attributes
    useEffect(() => {
        if (componentRef.current) {
            const currentTitle = componentRef.current.getAttribute('title');
            const currentItems = componentRef.current.getAttribute('items');

            if (currentTitle !== internalTitle) {
                componentRef.current.setAttribute('title', internalTitle);
            }

            const itemsString = JSON.stringify(list);
            if (currentItems !== itemsString) {
                componentRef.current.setAttribute('items', itemsString);
            }
        }
    }, [internalTitle, list]);

    const createNewItem = () => ({
        id: crypto.randomUUID(),
        index: list.length,
        text: '',
        guidande: '',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleListChange = useCallback(
        (newList: readonly unknown[], _movedItem: unknown, _oldIndex: number, _newIndex: number) => {
            setList(prev => {
                const updatedList = newList.map((item, index) => ({
                    ...(item as ListItem),
                    index,
                }));

                return JSON.stringify(prev) === JSON.stringify(updatedList) ? prev : updatedList;
            });
        },
        [],
    );

    const commonProps = {
        onTextChange: (id: string, text: string) => {
            setList(currentList => currentList.map(item => (item.id === id ? { ...item, text } : item)));
        },
        onGuidandeChange: (id: string, guidande: string) => {
            if (readonly) return;
            setList(currentList => currentList.map(item => (item.id === id ? { ...item, guidande } : item)));
        },
        onDeleteItem: (id: string) => {
            if (readonly) return;
            setList(currentList => currentList.filter(item => item.id !== id));
        },
        onAddItem: (id: string) => {
            if (readonly) return;
            setList(currentList => {
                const index = currentList.findIndex(item => item.id === id);
                const newItem = {
                    id: crypto.randomUUID(),
                    index: currentList.length,
                    text: '',
                    guidande: '',
                };
                return [...currentList.slice(0, index + 1), newItem, ...currentList.slice(index + 1)];
            });
        },
        onCollapseChange: (id: string) => {
            setActiveItemId(activeItemId === id ? null : id);
        },
        onNextItem: (currentId: string) => {
            const currentIndex = list.findIndex(item => item.id === currentId);
            setChecket(currentIndex);
            if (currentIndex < list.length - 1) {
                const nextItemId = list[currentIndex + 1].id;
                setActiveItemId(nextItemId);
            } else {
                setActiveItemId(null);
                setIsCollapsed(true);
            }
        },
        activeItemId,
        readonly,
    };

    const setChecket = (index: number) => {
        setCheckedItems(
            checkedItems.map((item, i) => {
                if (i === index) item = true;
                return item;
            }),
        );
    };

    if (isLoading)
        return (
            <div
                style={{
                    width: '100%',
                    height: '50px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Spin />
            </div>
        );
    return (
        <div
            contentEditable={false}
            className="guided-checklist"
            ref={el => {
                if (el) componentRef.current = el.closest('guided-checklist') as HTMLElement | undefined;
            }}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                <Input
                    readOnly={readonly}
                    className="title-input"
                    value={internalTitle}
                    onChange={e => setInternalTitle(e.target.value)}
                    placeholder={t('checklist_title_placeholder') || 'Checklist Title'}
                    onPaste={e => e.stopPropagation()}
                />
                <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                        if (isCollapsed && list.length > 0) {
                            setActiveItemId(list[0].id);
                        }
                        setIsCollapsed(!isCollapsed);
                    }}
                >
                    <BiCollapseVertical />
                </div>
            </div>
            {isCollapsed ? (
                <div className="collapse-list-icon" style={{ display: 'flex', gap: '5px' }}>
                    {list.map((_item, index) => {
                        return (
                            <div
                                className={checkedItems[index] ? 'collapse-list-icon-true' : 'collapse-list-icon-false'}
                            >
                                <FaCheckCircle />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div>
                    <div contentEditable={false} ref={containerRef}>
                        <DraggableList
                            itemKey="id"
                            template={Item}
                            list={list}
                            onMoveEnd={(newList, movedItem, oldIndex, newIndex) =>
                                handleListChange(newList, movedItem, oldIndex, newIndex)
                            }
                            container={() => containerRef.current!}
                            commonProps={commonProps}
                        />
                    </div>
                    {!readonly && (
                        <Button
                            className="add-item-button"
                            contentEditable={false}
                            onClick={() => commonProps.onAddItem(list[list.length - 1]?.id)}
                        >
                            +
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

customElements.define(
    'guided-checklist',
    reactToWebComponent(GuidedCheckListWC, React, ReactDOM, {
        props: {
            title: 'string',
            items: 'string',
            readonly: 'boolean',
        },
    }),
);
