                 styles.priorityBadge,
                          { backgroundColor: getPriorityColor(message.suggestedTask.priority) + '20' }
                        ]}>
                          <Text style={[
                            styles.priorityText,
                            { color: getPriorityColor(message.suggestedTask.priority) }
                          ]}>
                            {message.suggestedTask.priority.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity
                        style={styles.addTaskButton}
                        onPress={() => addTaskToPlanner(message.suggestedTask)}
                      >
                        <Plus size={16} color="#FFFFFF" />
                        <Text style={styles.addTaskButtonText}>Add to Planner</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}

            {isTyping && (
              <View style={[styles.messageContainer, styles.botMessageContainer]}>
                <View style={styles.messageHeader}>
                  <View style={[styles.avatarContainer, styles.botAvatar]}>
                    <Bot size={20} color="#6366F1" />
                  </View>
                </View>
                <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                  <View style={styles.typingIndicator}>
                    <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                    <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
                    <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </Animated.View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything or share your thoughts..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Send size={20} color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.promptsContainer}
            contentContainerStyle={styles.promptsContent}
          >
            {CHAT_PROMPTS.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.promptChip}
                onPress={() => setInputText(prompt)}
              >
                <Sparkles size={14} color="#6366F1" />
                <Text style={styles.promptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E0E7FF',
    lineHeight: 22,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageContainer: {
    marginBottom: 20,
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botAvatar: {
    backgroundColor: '#FFFFFF',
  },
  userAvatar: {
    backgroundColor: '#6366F1',
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  botText: {
    color: '#1F2937',
  },
  userText: {
    color: '#FFFFFF',
  },
  typingBubble: {
    paddingVertical: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 2,
  },
  suggestionsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '90%',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6366F1',
    marginLeft: 6,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
  },
  taskSuggestion: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '90%',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskSuggestionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 6,
  },
  taskContent: {
    gap: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    lineHeight: 22,
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskMetaText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  addTaskButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  promptsContainer: {
    maxHeight: 40,
  },
  promptsContent: {
    paddingRight: 20,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  promptText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
    marginLeft: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});